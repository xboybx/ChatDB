import { Client as PgClient } from 'pg';
import { MongoClient } from 'mongodb';

export async function testSQLConnection(connectionString) {
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

export async function testMongoConnection(connectionString) {
    const client = new MongoClient(connectionString);
    try {
        await client.connect();
        let dbName = undefined;
        try {
            const match = connectionString.match(/mongodb(?:\+srv)?:\/\/[^\/]+\/([^?]+)/);
            if (match && match[1]) dbName = match[1];
        } catch (e) {
            // Ignore parsing errors
        }
        const db = client.db(dbName || 'test');

        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name).slice(0, 20);

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
            collectionsInfo,
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