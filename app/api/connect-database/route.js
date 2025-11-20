import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Client as PgClient } from 'pg';
import { MongoClient } from 'mongodb';
import CryptoJS from 'crypto-js';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

async function testSQLConnection(connectionString) {
  const client = new PgClient({ connectionString });
  try {
    await client.connect();

    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      LIMIT 10
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    const schemaInfo = { tables, type: 'sql' };

    if (tables.length > 0) {
      const columnsResult = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
      `, [tables[0]]);

      schemaInfo.sampleTable = tables[0];
      schemaInfo.columns = columnsResult.rows;
    }

    await client.end();
    return schemaInfo;
  } catch (error) {
    await client.end();
    throw error;
  }
}

async function testMongoConnection(connectionString) {
  console.log('Testing MongoDB connection with connection string:')
  const client = new MongoClient(connectionString);
  try {
    await client.connect();
    // Extract database name from connection string
    let dbName = undefined;
    try {
      // Works for both mongodb+srv and mongodb://
      const match = connectionString.match(/mongodb(?:\+srv)?:\/\/[^\/]+\/([^?]+)/);
      if (match && match[1]) dbName = match[1];
    } catch (e) { }
    // Fallback to 'test' if not found
    const db = client.db(dbName || 'test');
    // console.log('Using MongoDB database:', db.databaseName);

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).slice(0, 20); // scan up to 20 collections

    // For each collection, sample a document and get its field names
    const collectionsInfo = [];
    for (const name of collectionNames) {
      const collection = db.collection(name);
      const sampleDoc = await collection.findOne({});
      collectionsInfo.push({
        name,
        sampleFields: sampleDoc ? Object.keys(sampleDoc) : [],
      });
    }

    const schemaInfo = {
      collections: collectionNames,
      collectionsInfo, // array of { name, sampleFields }
      type: 'mongodb',
      dbName: db.databaseName,
    };

    await client.close();
    return schemaInfo;
  } catch (error) {
    await client.close();
    throw error;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    //we get the connection string type and conversation id from the request body form dataUpload js
    console.log('Received the data request to /api/connect-database:', body);

    const { connectionString, type, conversationId } = body;

    if (!connectionString || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    //This is the variable where the copy of the database schema info will be stored in DB
    let schemaInfo;

    if (type === 'sql') {
      let modifiedConnectionString = connectionString;

      schemaInfo = await testSQLConnection(modifiedConnectionString);
    }
    else if (type === 'mongodb') {
      schemaInfo = await testMongoConnection(connectionString);
    }
    else {
      return NextResponse.json(
        { success: false, error: 'Invalid database type' },
        { status: 400 }
      );
    }

    const userId = 'demo-user-id';
    const dbName = connectionString.split('/').pop().split('?')[0];

    const encryptedConnectionString = CryptoJS.AES.encrypt(connectionString, process.env.ENCRYPTION_KEY).toString();

    const { data: dataset, error } = await supabase
      .from('datasets')
      .insert([
        {
          user_id: userId,
          conversation_id: conversationId || null,
          name: `${type.toUpperCase()} - ${dbName}`,
          type,
          connection_string: encryptedConnectionString,
          schema_info: schemaInfo,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      dataset,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to connect to database' },
      { status: 500 }
    );
  }
}