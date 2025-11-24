import { NextResponse } from 'next/server';
import { callGeminiAPI } from '../../../lib/ai.js';
import {
  getDatasetById,
  saveMessage,
  updateConversationTitle
} from '../../../lib/database.js';
import { constructPrompt } from '../../../lib/prompt';



export const dynamic = 'force-dynamic';


export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationId, message, queryLanguage, datasetId } = body;//datasetId is sent only when file is uploaded

    // console.log("all the data from fN", conversationId, message, queryLanguage, datasetId)


    // 1. Save user message
    await saveMessage({
      conversation_id: conversationId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    });

    // if (userMsgError) throw userMsgError;

    // 2. Handle case where no dataset is selected
    if (!datasetId) {
      const assistantMessage = await saveMessage({
        conversation_id: conversationId,
        role: 'assistant',
        content:
          'Please upload a file or connect to a database first before asking questions.',
      });

      return NextResponse.json({
        success: true,
        assistantMessage,
      });
    }

    // 3. Get dataset details
    const dataset = await getDatasetById(datasetId);

    if (!dataset) {
      throw new Error('Dataset not found');
    }




    // let prompt = '';
    // let queryLanguageToUse = queryLanguage;



    // 4. Construct the prompt
    const prompt = constructPrompt(dataset, message);

    // 5. Get AI response
    const aiResponse = await callGeminiAPI(prompt);

    // 6. Process AI response
    let queryCommand = null;
    let queryResult = [];
    let naturalResponse = '';
    const isFileData = ['xlsx', 'xls', 'csv', 'pdf', 'docx'].includes(
      dataset.type
    )

    if (isFileData) {
      // For file data, the AI gives the answer directly.
      // No query is generated or executed.
      naturalResponse = aiResponse;
    } else {
      // For SQL/Mongo, we extract the query command for the 'Generated Query' tab,
      // and use the full AI response for the chat message.
      naturalResponse = aiResponse;

      const codeBlockRegex = /```(?:sql|json|javascript)?\n?([\s\S]+?)\n?```/;
      const match = aiResponse.match(codeBlockRegex);

      if (match && match[1]) {
        queryCommand = match[1].trim();
      }
      // If no match, queryCommand remains as it was initialized (null)
    }


    // 7. Save AI message
    const assistantMessage = await saveMessage({
      conversation_id: conversationId,
      role: 'assistant',
      content: naturalResponse,
      query_command: queryCommand,
      created_at: new Date().toISOString(),
    });

    // 8. Update conversation title
    await updateConversationTitle(conversationId, message.slice(0, 50))

    return NextResponse.json({
      success: true,
      assistantMessage,
    });
  } catch (error) {
    console.error('Query API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}