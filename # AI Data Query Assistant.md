# AI Data Query Assistant

This document provides a detailed explanation of the AI Data Query Assistant application. It covers the project's architecture, frontend and backend components, key packages, and data flow.

## Chapter 1: Project Overview

The AI Data Query Assistant is a web-based application that allows users to ask questions about their data in natural language. Users can either upload a file (CSV or Excel) or connect to a database (PostgreSQL or MongoDB). The application then uses a powerful AI model (Gemini-Pro) to understand the user's question, generate a query, and return a human-readable answer.

The application is built with Next.js, a popular React framework, and uses Supabase for its backend infrastructure, including database storage and authentication.

### Key Features:

*   **Natural Language Queries:** Ask questions in plain English.
*   **File Uploads:** Supports CSV and Excel files.
*   **Database Connections:** Connect to PostgreSQL and MongoDB databases.
*   **AI-Powered:** Uses the Gemini-Pro model to generate queries and summarize results.
*   **Conversation History:** Saves your conversations for future reference.

## Chapter 2: Frontend (The User Interface)

The frontend is built with React and Next.js and is responsible for everything the user sees and interacts with. The main user interface is defined in the `app/page.jsx` file.

### `app/page.jsx`

This file contains the main React component for the chat interface. It manages the application's state, handles user input, and communicates with the backend API.

#### State Management:

The component uses the `useState` hook to manage its state, which includes:

*   `conversations`: A list of all the user's conversations.
*   `activeConversationId`: The ID of the currently selected conversation.
*   `messages`: A list of all the messages in the active conversation.
*   `inputValue`: The text in the message input field.
*   `isThinking`: A boolean that indicates whether the AI is processing a request.
*   `queryLanguage`: The query language to use (auto, SQL, or MongoDB).
*   `showUploadDialog`: A boolean that controls the visibility of the file upload dialog.
*   `activeDataset`: The currently loaded dataset (either a file or a database connection).

#### Key Functions:

*   `loadConversations()`: Fetches the user's conversations from the backend.
*   `loadMessages(conversationId)`: Fetches the messages for a specific conversation.
*   `loadDataset(conversationId)`: Fetches the dataset associated with a conversation.
*   `handleNewConversation()`: Creates a new conversation.
*   `handleDeleteConversation(conversationId)`: Deletes a conversation.
*   `handleSendMessage()`: Sends the user's message to the backend for processing.
*   `handleKeyPress(e)`: Sends the message when the user presses "Enter".
*   `handleDatasetAdded(dataset)`: Updates the active dataset when a new one is added.

#### How it Works:

1.  When the component mounts, it calls `loadConversations()` to fetch the user's past conversations.
2.  When the user selects a conversation, the `activeConversationId` state is updated, which triggers `loadMessages()` and `loadDataset()` to fetch the relevant data.
3.  When the user types a message and clicks "Send" (or presses "Enter"), the `handleSendMessage()` function is called.
4.  `handleSendMessage()` sends a POST request to the `/api/query` endpoint with the user's message, the active conversation ID, and the query language.
5.  While waiting for the response, the `isThinking` state is set to `true`, which displays a "thinking" indicator to the user.
6.  When the response is received, the `messages` state is updated with the AI's response, and `isThinking` is set back to `false`.

## Chapter 3: Backend (The Brains of the Operation)

The backend is built with Next.js API Routes and is responsible for handling all the application's logic, including connecting to databases, processing user queries, and interacting with the Gemini API.

### `app/api/query/route.js`

This is the core of the backend. It receives user questions, generates queries, executes them, and returns a natural language response.

#### How it Works:

1.  The `POST` function is the main entry point. It receives the `conversationId`, `message`, `queryLanguage`, and `datasetId` from the frontend.
2.  It first checks if a `datasetId` is provided. If not, it returns a message asking the user to upload a file or connect to a database.
3.  It then fetches the dataset from the Supabase database.
4.  It determines the query language to use. If the user has selected "auto," it will choose the appropriate language based on the dataset type (SQL for files and SQL databases, MongoDB for MongoDB databases).
5.  It constructs a `prompt` for the Gemini API. This prompt includes the database schema (or file data), the user's question, and instructions for generating a query.
6.  It calls the `callGeminiAPI()` function to send the prompt to the Gemini API and get a query in return.
7.  It then executes the query using one of the following functions:
    *   `executeQueryOnFileData()`: For queries on uploaded files.
    *   `executeSQLQuery()`: For queries on SQL databases.
    *   `executeMongoQuery()`: For queries on MongoDB databases.
8.  After executing the query, it constructs another prompt to summarize the results in natural language.
9.  It calls `callGeminiAPI()` again to get the final, human-readable answer.
10. Finally, it saves the user's message and the AI's response to the `messages` table in the Supabase database and returns the response to the frontend.

### `app/api/upload-dataset/route.js`

This route handles file uploads.

#### How it Works:

1.  The `POST` function receives a file and a `conversationId` from the frontend.
2.  It parses the file based on its extension (CSV or Excel).
3.  For CSV files, it manually parses the data line by line.
4.  For Excel files, it uses the `xlsx` library to parse the data.
5.  It then extracts schema information from the parsed data, such as the column names and the number of rows.
6.  Finally, it saves the file name, type, schema information, and parsed data to the `datasets` table in the Supabase database.

### `app/api/connect-database/route.js`

This route handles database connections.

#### How it Works:

1.  The `POST` function receives a `connectionString`, `type` (SQL or MongoDB), and `conversationId` from the frontend.
2.  It tests the connection to the database using one of the following functions:
    *   `testSQLConnection()`: For SQL databases.
    *   `testMongoConnection()`: For MongoDB databases.
3.  These functions connect to the database, fetch schema information (tables, columns, etc.), and then close the connection.
4.  If the connection is successful, it saves the connection string, database type, and schema information to the `datasets` table in the Supabase database.

## Chapter 4: Key Packages and Their Roles

*   **Next.js:** A React framework for building server-rendered and statically-generated web applications.
*   **Supabase:** A backend-as-a-service platform that provides a PostgreSQL database, authentication, and storage.
*   **`@supabase/supabase-js`:** The official JavaScript client for Supabase.
*   **`pg`:** A PostgreSQL client for Node.js.
*   **`mongodb`:** The official MongoDB driver for Node.js.
*   **`alasql`:** A JavaScript SQL database library that allows you to run SQL queries on in-memory data.
*   **`xlsx`:** A library for reading and writing Excel files.
*   **Gemini API:** A powerful AI model from Google that is used to generate queries and summarize results.
*   **`lucide-react`:** A library of simply beautiful icons.
*   **`@radix-ui/react-*`:** A collection of unstyled, accessible UI components.
*   **`tailwindcss`:** A utility-first CSS framework for rapidly building custom designs.

## Chapter 5: Data Flow

Here's a step-by-step walkthrough of how data flows through the application when a user asks a question about an uploaded file:

1.  **User asks a question:** The user types a question into the chat input and clicks "Send."
2.  **Frontend sends request:** The `handleSendMessage()` function in `app/page.jsx` sends a POST request to `/api/query` with the user's question and the active conversation ID.
3.  **Backend receives request:** The `POST` function in `app/api/query/route.js` receives the request.
4.  **Backend fetches dataset:** The backend fetches the dataset from the `datasets` table in the Supabase database.
5.  **Backend generates query:** The backend constructs a prompt for the Gemini API, including the file data and the user's question. It then calls the Gemini API to generate a SQL query.
6.  **Backend executes query:** The backend uses `alasql` to execute the SQL query on the in-memory file data.
7.  **Backend summarizes results:** The backend constructs another prompt for the Gemini API, including the query results. It then calls the Gemini API to generate a natural language summary of the results.
8.  **Backend saves message:** The backend saves the AI's response to the `messages` table in the Supabase database.
9.  **Backend sends response:** The backend sends the AI's response back to the frontend.
10. **Frontend displays response:** The frontend receives the response and displays it to the user.
