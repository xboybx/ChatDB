import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { log } from 'console';




const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

export async function POST(request) {
  // console.log('Request received:', request);
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const conversationId = formData.get('conversationId');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }


    //Reading the Data: This is the crucial step. The line const buffer = await file.arrayBuffer();
    //  reads the entire file content into a variable called buffer. 
    // This is where your actual file data resides on the server
    const buffer = await file.arrayBuffer();
    // console.log('File buffer received on server (first 50 bytes):', buffer.slice(0, 50));
    const fileExtension = file.name.split('.').pop().toLowerCase();


    //Now that the server has the raw bytes, it needs to understand them. This is where parsing comes in.
    //  The code checks the file extension (.csv, .xlsx, etc.) and uses a different strategy for each.
    let parsedData = [];
    let schemaInfo = {};



    //PARSING OF CSV FILES and extracting schema info and also Excel

    if (fileExtension === 'csv') {
      //Decode: new TextDecoder().decode(buffer) converts the raw bytes from the buffer into a single, long string.
      const text = new TextDecoder().decode(buffer);
      //Split into Lines: text.split('\n') breaks that string into an array, with each element being one line from the file.
      const lines = text.split('\n').filter(line => line.trim());

      //Get Headers: lines[0].split(',') takes the very first line (the headers) and splits it by the comma to get an array of column names
      //  (e.g., ['Name', 'Email', 'Company']).
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const headers = lines[0].split(',').map(h => h.trim());

      //Builds Json Objects: The code then loops through the remaining lines (the actual data rows),
      //  splits each line by commas, and constructs an object for each row where the keys are the column names
      //  and the values are the corresponding data entries.
      parsedData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });

      schemaInfo = {//to be used or to store parsed data in db in schema format  through supabas
        columns: headers,
        rowCount: parsedData.length,
        sample: parsedData.slice(0, 5),
      };
      //PARSING OF XCEL FILES
    }
    else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const workbook = xlsx.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      parsedData = xlsx.utils.sheet_to_json(worksheet);
      // console.log('Parsed data on server (first 5 rows):', parsedData.slice(0, 5))

      if (parsedData.length === 0) {
        throw new Error('Excel file is empty');
      }

      const columns = Object.keys(parsedData[0]);
      schemaInfo = {//to be used or to store parsed data in db in schema format  through supabase
        columns,
        rowCount: parsedData.length,
        sample: parsedData.slice(0, 5),
        sheetName,
      };
    }

    //PARSING OF PDF FILES
    else if (fileExtension === 'pdf' || fileExtension === 'PDF') {
      const parser = new PDFParse({ data: Buffer.from(buffer) });
      const data = await parser.getText();

      parsedData = data.text;
      schemaInfo = {
        pageCount: data.numpages,
        info: data.info,
        sample: data.text.substring(0, 500),//first 500 characters of pdf
      };
    }
    //PARSING OF DOCX FILES
    else if (fileExtension === 'docx' || fileExtension === 'DOCX') {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      const text = result.value;
      parsedData = text;
      schemaInfo = {
        charCount: text.length,
        sample: text.substring(0, 500),
      };
    }

    else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file format. Please use Excel or CSV.' },
        { status: 400 }
      );
    }

    const userId = 'demo-user-id';

    const { data: dataset, error } = await supabase
      .from('datasets')
      .insert([
        {
          user_id: userId,
          conversation_id: conversationId || null,
          name: file.name,
          type: fileExtension,
          schema_info: schemaInfo,//schmea of parsed data
          file_data: parsedData,//actual parsed data to be stored in supabase
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    // console.log('Dataset uploaded Sucessfully', 'Error:', error);

    if (error) throw error;

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