-- RAG Foundation Setup
-- Run this in your Supabase SQL Editor

-- 1. Enable the vector extension. 
-- This allows Postgres to understand 'meaning' (vectors) not just text.
create extension if not exists vector;

-- 2. Create a table to store document chunks.
-- Instead of one giant file, we break it into small pieces (chunks).
create table if not exists documents (
  id bigserial primary key,
  content text, -- The actual text of the chunk
  metadata jsonb, -- Info like "Page 1", "Source: file.pdf"
  embedding vector(768) -- The 'brain' representation (768 dimensions for Gemini)
);

-- 3. Create a search function.
-- This allows us to find chunks that are 'semantically similar' to a user's question.
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
