import { NextResponse } from 'next/server';
import { testSQLConnection, testMongoConnection } from '../../../lib/db-connection';
import { createDataset } from '../../../lib/database';
import CryptoJS from 'crypto-js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    //we get the connection string type and conversation id from the request body form dataUpload js
    // console.log('Received the data request to /api/connect-database:', body);

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

    //Create a new dataset entry in the database with the connection details and schema info
    const newDataset = await createDataset({
      user_id: userId,
      conversation_id: conversationId || null,
      name: `${type.toUpperCase()} - ${dbName}`,
      type,
      connection_string: encryptedConnectionString,
      schema_info: schemaInfo,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      dataset: newDataset,
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to connect to database' },
      { status: 500 }
    );
  }
}