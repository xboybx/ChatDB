/**
 * Constructs the prompt for the AI based on the dataset and user message.
 * @param {object} dataset - The dataset object from Supabase.
 * @param {string} message - The user's message.
 * @returns {string} The fully constructed prompt.
 */
export function constructPrompt(dataset, message) {
    const isFileData = ['xlsx', 'xls', 'csv', 'pdf', 'docx'].includes(dataset.type);

    if (isFileData) {
        return `You are a data analysis assistant. The user has uploaded a file and is asking questions about it. Your task is to analyze the provided data and answer the user's question in simple English.
              Here is the full dataset in JSON format:${JSON.stringify(dataset.file_data)}
              User Question: "${message}".
              Based on the data, provide a clear and concise answer. Do not generate SQL queries. Just provide the answer.
              I am also providing the date and time to make refernece the user when needed or asked : ${new Date().toUTCString()}. Use this information if relevant to the user's question and also if hte user imformation is releated about time and date imformation or if its depends on it.`;
    }

    if (dataset.type === 'sql') {
        const sampleTable = dataset.schema_info;
        return `You are an AI assistant that generates database queries. Based on the user's question and the provided database schema, generate the appropriate query. Do not execute the query. Only return the query command itself.
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
             {IMPORTANT}:YOu will have the sampletable data with you,when users asks about the dbs,or tables,coloums and rows thier type information give it along with query commands.`;
    }

    if (dataset.type === 'mongodb') {
        const sampleTable = dataset.schema_info;
        return `You are an AI assistant that generates database queries. Based on the user's question and the provided database schema, generate the appropriate query. Do not execute the query. Only return the query command itself.
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

    // Fallback for unknown types
    return `You are a helpful assistant. Please answer the user's question: "${message}"`;
}