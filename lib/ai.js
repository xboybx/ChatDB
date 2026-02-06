
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


//AI Service
export const callGeminiAPI = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                }
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



// import OpenAI from "openai";

// const FREE_MODELS = [
//     "upstage/solar-pro-3:free",
//     "liquid/lfm-2.5-1.2b-thinking:free",
//     "allenai/molmo-2-8b:free",
//     "qwen/qwen3-coder:free",
//     "meta-llama/llama-3.3-70b-instruct:free",
// ];


// const openRouter = new OpenAI({
//     baseURL: 'https://openrouter.ai/api/v1',
//     apiKey: process.env.OPENROUTER_API_KEY || '<OPENROUTER_API_KEY>',
//     defaultHeaders: {
//         'HTTP-Referer': "https://chatdb.com",
//         'X-Title': 'ChatDB',
//     },
// });

// //calling ai fundtions
// export async function call_AI_models(prompt, contextcode, systemPromptOverride, status) {
//     const userPrompt = contextCode ? `Code Context:\n\`\`\`\n${contextCode}\n\`\`\`\n\nTask: ${message}` : message;

  

// }






