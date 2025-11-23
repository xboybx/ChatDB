# AI-Driven Data Query Web App

The AI Data Query Assistant is a web-based application that allows users to ask questions about their data in natural language. Users can either upload a file (CSV or Excel) or connect to a database (PostgreSQL or MongoDB). The application then uses a powerful AI model (Gemini-Pro) to understand the user's question, generate a query, and return a human-readable answer.

The application is built with Next.js, a popular React framework, and uses Supabase for its backend infrastructure, including database storage.

![Demo](https://ik.imagekit.io/mtkm3escy/ChatDB%20DEMO.gif)
[***Live Demo***](https://chatdb-p4zb.onrender.com/)

## Features

✨ **ChatGPT-Style Interface** - Clean, intuitive chat UI with conversation history
📊 **Multiple Data Sources** - Support for Excel, CSV, MongoDB, and SQL databases
🤖 **AI-Powered Queries** - Automatic query generation using Gemini AI
🔍 **Query Transparency** - See the generated SQL/MongoDB queries
📈 **Data Visualization** - Tabular results display with scrolling
🔒 **Secure** - Row-level security with Supabase authentication

## Tech Stack

- **Frontend:** Next.js 13, React 18, TailwindCSS, Shadcn/UI
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API
- **Data Handling:** XLSX parser, PostgreSQL driver, MongoDB driver

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase project ([Sign up free](https://supabase.com))
- A Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))
- Optional: MongoDB connection string (for MongoDB queries)
- Optional: PostgreSQL/MySQL connection string (for SQL queries)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install all dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Settings** > **API** to find:
   - Project URL → Copy to `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → Copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key** in new project
3. Copy the generated key
4. Paste it into `.env.local` as `GEMINI_API_KEY`

### 5. Initialize Database Schema

The database schema will be automatically initialized when you first deploy. However, you can manually apply the migrations:

```bash
# The schema includes:
# - conversations table (for chat history)
# - messages table (for storing queries and results)
# - datasets table (for uploaded files and connections)
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Uploading Data

1. Click **Upload File** button
2. Select an Excel (.xlsx, .xls) or CSV (.csv) file
3. Wait for parsing confirmation
4. Start asking questions about your data

### Connecting to a Database

1. Click **Connect DB** button
2. Select database type (PostgreSQL/MySQL or MongoDB)
3. Paste your connection string
4. System will verify connection and load schema
5. Ask questions about your database

### Asking Questions

Simply type natural language questions:
- "Show me total sales by month"
- "What are the top 5 products?"
- "Calculate average revenue by category"
- "Find all records where price > 100"

The AI will:
1. Generate the appropriate query (SQL or MongoDB)
2. Execute it against your data
3. Return results with a natural language summary

### Selecting Query Language

Use the **Query Language** dropdown to:
- **Auto** - Let AI decide the best format
- **SQL** - Force SQL queries
- **MongoDB** - Force MongoDB queries

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |

## Database Connection Strings

### PostgreSQL
```
postgresql://username:password@host:5432/database_name
```

### MySQL
```
mysql://username:password@host:3306/database_name
```

### MongoDB
```
mongodb://username:password@host:27017/database_name
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

## API Endpoints

### Chat & Conversations

- `POST /api/conversations` - Create new conversation
- `GET /api/conversations` - Get all conversations
- `DELETE /api/conversations?id=conversationId` - Delete conversation
- `GET /api/messages?conversationId=id` - Get messages in conversation
- `POST /api/query` - Send message and get AI response

### Data Management

- `POST /api/upload-dataset` - Upload Excel/CSV file
- `POST /api/connect-database` - Connect to MongoDB/SQL database
- `GET /api/dataset?conversationId=id` - Get active dataset

## File Structure

```
project/
├── app/
│   ├── api/                    # API routes
│   │   ├── conversations/
│   │   ├── messages/
│   │   ├── query/
│   │   ├── upload-dataset/
│   │   ├── connect-database/
│   │   └── dataset/
│   ├── page.js                 # Main chat interface
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ChatMessage.js          # Message display
│   ├── ChatSidebar.js          # Conversation sidebar
│   ├── ThinkingIndicator.js    # Loading state
│   ├── DatasetUpload.js        # Upload dialog
│   └── ui/                     # Shadcn UI components
├── lib/
│   ├── supabase.js            # Supabase client
│   └── utils.ts
├── .env.local                  # Environment variables
└── package.json
```

## Security Considerations

- **Never commit `.env.local`** to version control
- Connection strings are stored encrypted in Supabase
- All database queries are executed server-side
- Supabase Row-Level Security (RLS) protects user data
- API keys are kept confidential on the server

## Troubleshooting

### "GEMINI_API_KEY is not configured"
- Check `.env.local` has the correct key
- Ensure the key is valid and not expired
- Restart the dev server after changing `.env.local`

### "Failed to connect to database"
- Verify connection string format
- Ensure database is accessible from your network
- Check username and password credentials

### "Dataset not found"
- Re-upload or reconnect your data source
- Clear browser cache if issue persists

### Build errors
```bash
npm run lint          # Check for linting issues
npm run typecheck    # Verify TypeScript types
npm run build        # Full build test
```

## Performance Tips

- Upload smaller files first to test (< 10MB recommended)
- Limit database connections to frequently-queried databases
- Results cache automatically in conversation history
- Use pagination for large result sets

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Data export (PDF, CSV)
- [ ] Advanced charting options
- [ ] Query scheduling and automation
- [ ] Team collaboration features
- [ ] Custom model selection

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API error messages
3. Verify environment variables are correct
4. Check browser console for detailed errors

## Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API Guide](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
