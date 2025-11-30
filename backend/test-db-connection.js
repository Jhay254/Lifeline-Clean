const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://lifeline:lifeline_dev_password@127.0.0.1:5432/lifeline_db?schema=public",
});

async function testConnection() {
    try {
        console.log('Attempting to connect to PostgreSQL...');
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
