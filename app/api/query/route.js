import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Client as PgClient } from 'pg';
import { MongoClient } from 'mongodb';

const systemInstruction = `

                You are an Datbase engineer ,you analyze and summarize data in a very accurate and intelliegnt way
                when user chats and asks about any avaliable data you respond to the user with relative consize answers .
                --This is if the dataset.type is sql or mongodn
                You are an AI assistant that generates database queries. Based on the user's question and the provided database schema, generate the appropriate query. Do not execute the query. Only return the query command itself.
                You will be given a Sample Table and this is the information Schema of a databse in the object format -that is extracted from a function and saved in the
                Sample Table by the function when the user gives the particular database Connection sting.
                [The data Recieved to you in the order of:
                1.user gives/uploads the connection Sting
                2.The Concerned Datasbase functions extractes the schema and sample data form the databse ans storeed in Sample Table
                3.then served to you in the prompt to give user correct and accurate data based on the Sample Table ].
`
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {

      method: 'POST',
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    if (data.error?.message.includes('models/gemini-pro is not found for API version v1beta')) {
      throw new Error('GEMINI_MODEL_NOT_FOUND');
    }
    throw new Error(data.error?.message || 'Gemini API error');
  }

  return data.candidates[0].content.parts[0].text;
}

// async function executeSQLQuery(connectionString, query) {
//   const client = new PgClient({ connectionString });
//   try {
//     await client.connect();
//     const result = await client.query(query);
//     await client.end();
//     return result.rows;
//   } catch (error) {
//     await client.end();
//     throw error;
//   }
// }

// async function executeMongoQuery(connectionString, query) {
//   const client = new MongoClient(connectionString);
//   try {
//     await client.connect();
//     const db = client.db();

//     const queryObj = JSON.parse(query);

//     let result;
//     if (queryObj.operation === 'find') {
//       const collection = db.collection(queryObj.collection);
//       result = await collection.find(queryObj.filter || {}).limit(queryObj.limit || 100).toArray();
//     } else if (queryObj.operation === 'aggregate') {
//       const collection = db.collection(queryObj.collection);
//       result = await collection.aggregate(queryObj.pipeline).toArray();
//     } else if (queryObj.operation === 'listCollections') {
//       const collections = await db.listCollections().toArray();
//       result = collections.map(c => ({ name: c.name }));
//     } else {
//       throw new Error('Unsupported MongoDB operation');
//     }

//     await client.close();
//     return result;
//   } catch (error) {
//     await client.close();
//     throw error;
//   }
// }

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationId, message, queryLanguage, datasetId } = body;//datasetId is sent only when file is uploaded

    // console.log("all the data from fN", conversationId, message, queryLanguage, datasetId)

    //To Insert Messages in databse history
    const { data: userMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role: 'user',
          content: message,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (userMsgError) throw userMsgError;

    // If no dataset is associated, prompt user to upload/connect
    if (!datasetId) {
      const { data: assistantMessage, error: assistantMsgError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: 'Please upload a file or connect to a database first before asking questions.',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      return NextResponse.json({
        success: true,
        assistantMessage,
      });
    }

    const { data: dataset } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (!dataset) {
      throw new Error('Dataset not found');
    }


    // console.log("Dataset fetched:", JSON.stringify(dataset.file_data));

    let prompt = '';
    let queryLanguageToUse = queryLanguage;
    const isFileData = dataset.type === 'xlsx' || dataset.type === 'xls' || dataset.type === 'csv' || dataset.type === 'pdf' || dataset.type === 'docx';
    //This is a crucial boolean flag. It checks if the dataset is a file upload. 
    // This flag will determine which prompt to build.
    // console.log("Dataset type:", isFileData);


    //Auto-Detecting the Query Language
    // if (queryLanguageToUse === 'auto') {
    //   if (isFileData) {
    //     queryLanguageToUse = 'sql';//true means set to sql
    //   } else {
    //     queryLanguageToUse = dataset.type === 'mongodb' ? 'mongodb' : 'sql';//false means mongodb
    //   }
    // }




    // Thought process
    // That's an excellent and very important question. It gets to the core of how this application maintains a "conversation" about your data.
    // You are correct on the first part: when the user sends the first message, the file_data is sent to the AI in the prompt, and the result is saved in the messages table.
    // To answer the second part of your question: For every single request you make, the entire file_data is fetched from the database and sent with the prompt to the AI.
    // The AI does not have a persistent memory of your data. The application is designed to be stateless. This means that every API call to /api/query is independent and must contain all the information the AI
    if (isFileData) {
      prompt = `You are a data analysis assistant. The user has uploaded a file and is asking questions about it. Your task is to analyze the provided data and answer the user's question in simple English.
                Here is the full dataset in JSON format:${JSON.stringify(dataset.file_data)}
                User Question: "${message}".
                Based on the data, provide a clear and concise answer. Do not generate SQL queries. Just provide the answer.
                I am also providing the date and time to make refernece the user when needed or asked : ${new Date().toUTCString()}. Use this information if relevant to the user's question and also if hte user imformation is releated about time and date imformation or if its depends on it.`;
    }
    else if (dataset.type === 'sql') {
      // const tables = dataset.schema_info.tables || [];
      const sampleTable = dataset.schema_info;
      // console.log("Sample Table from schema_info:", JSON.stringify(sampleTable))
      // const columns = dataset.schema_info.columns || [];

      prompt = `You are an AI assistant that generates database queries. Based on the user's question and the provided database schema, generate the appropriate query. Do not execute the query. Only return the query command itself.
                You will be given a Sample Table and this is the information Schema of a databse in the object format -that is extracted from a function and saved in the
                Sample Table by the function when the user gives the particular database Connection sting.
                [The data Recieved to you in the order of:
                1.user gives/uploads the connection Sting
                2.The Concerned Datasbase functions extractes the schema and sample data form the databse ans storeed in Sample Table
                3.then served to you in the prompt to give user correct and accurate data based on the Sample Table ].

                Database Type: PostgreSQL
                Database Schema:
                - Sample Table: ${JSON.stringify(sampleTable, null, 2)}
                
                User Question: "${message}"
                Generate a valid PostgreSQL query that answers the user's question
                according to the Sample Table schema
                the idea is to make users to be able to manipulate databases even 
                tough they don't know the Database languages as you are smart enough to figure them out,
                 based on the Sample Table you need to generate the required queries by analyzing and mapping
               the question to Sample Table and give the correct and accurate PostgreSQL commands or queries.
              !and after giving the command in the next next line give your summary or info you want to give about the command or query.;
               {IMPORTANT}:YOu will have the sampletable data with you,when users asks about the dbs,or tables,coloums and rows thier type information give it along with query commands.`

    }

    else if (dataset.type === 'mongodb') {
      const sampleTable = dataset.schema_info;
      // console.log("Sample Table from schema_info:", JSON.stringify(sampleTable));

      prompt = `You are an AI assistant that generates database queries. Based on the user's question and the provided database schema, generate the appropriate query. Do not execute the query. Only return the query command itself.
                You will be given a Sample Table and this is the information Schmea of a databse in the object format -that is extracted from a function and saved in the
                Sample Table by the function when the user gives the particular database Connection sting.
                [The data Recieved to you in the order of:
                1.user gives/uploads the connection Sting
                2.The Concerned Datasbase functions extractes the schema and sample data form the databse ans storeed in Sample Table
                3.then served to you in the prompt to give user correct and accurate data based on the Sample Table ].               
                Database Type: MongoDB
                Database Schema:
                - Sample Table: ${JSON.stringify(sampleTable)}

                User Question: "${message}"

                Generate a valid MongoDB query that answers the user's question
                according to the Sample Table schema
                the idea is to make users to be able to manipulate databses even 
                tough they don't know the Database languages as you are smart enough to figure them out,
                 based on the Sample Table you need to generate the required queries by analyzing and mapping
              the question to Sample Table and give the correct and accurate mongodb commands or queries.
              !and after giving the command in the next next line give your summary or info you want to give about the command or query.
    {IMPORTANT}:YOu will have the sampletable data with you,when users asks about the dbs,or collections,and the collections and documents information give it along with query commands.
                               `;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////

    const aiResponse = await callGeminiAPI(prompt);

    let queryCommand = null;
    let queryResult = [];
    let naturalResponse = '';

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


    const { data: assistantMessage, error: assistantMsgError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role: 'assistant',
          content: naturalResponse,
          query_command: queryCommand,
          query_result: queryResult.length > 0 ? queryResult : null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (assistantMsgError) throw assistantMsgError;

    await supabase
      .from('conversations')
      .update({
        title: message.slice(0, 50),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

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