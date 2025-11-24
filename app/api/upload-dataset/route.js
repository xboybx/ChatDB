import { NextResponse } from 'next/server';
import xlsx from 'xlsx';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { createDataset, findOrCreateConversation } from '../../../lib/database';

export const dynamic = 'force-dynamic';

async function parseFile(file, fileExtension, buffer) {
  let parsedData = [];
  let schemaInfo = {};

  if (fileExtension === 'csv') {
    const text = new TextDecoder().decode(buffer);
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) throw new Error('CSV file is empty');
    const headers = lines[0].split(',').map(h => h.trim());
    parsedData = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i] || '';
        return obj;
      }, {});
    });
    schemaInfo = { columns: headers, rowCount: parsedData.length, sample: parsedData.slice(0, 5) };
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    const workbook = xlsx.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    parsedData = xlsx.utils.sheet_to_json(worksheet);
    if (parsedData.length === 0) throw new Error('Excel file is empty');
    const columns = Object.keys(parsedData[0]);
    schemaInfo = { columns, rowCount: parsedData.length, sample: parsedData.slice(0, 5), sheetName };
  } else if (fileExtension === 'pdf') {
    const data = await new PDFParse({ data: Buffer.from(buffer) }).getText();
    parsedData = data.text;
    schemaInfo = { pageCount: data.numpages, info: data.info, sample: data.text.substring(0, 500) };
  } else if (fileExtension === 'docx') {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    parsedData = result.value;
    schemaInfo = { charCount: parsedData.length, sample: parsedData.substring(0, 500) };
  } else {
    throw new Error('Unsupported file format.');
  }

  return { parsedData, schemaInfo };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const conversationId = formData.get('conversationId');

    if (!file || !conversationId) {
      return NextResponse.json(
        { success: false, error: 'No file or conversationId provided' },
        { status: 400 }
      );
    }

    await findOrCreateConversation(conversationId);

    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split('.').pop().toLowerCase();

    const { parsedData, schemaInfo } = await parseFile(file, fileExtension, buffer);

    const userId = 'demo-user-id';

    const dataset = await createDataset({
      user_id: userId,
      conversation_id: conversationId,
      name: file.name,
      type: fileExtension,
      schema_info: schemaInfo,
      file_data: parsedData,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      dataset,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}