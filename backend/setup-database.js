/**
 * SPACE STRIKE Database Setup Script
 * Automatically initializes the PostgreSQL database with schema
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    console.log('🚀 SPACE STRIKE Database Setup');
    console.log('================================\n');

    // Validate environment variables
    if (!process.env.DB_PASSWORD) {
        console.error('❌ Error: DB_PASSWORD not set in .env file');
        console.log('Please copy .env.example to .env and configure your database credentials');
        process.exit(1);
    }

    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'space_strike',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('📡 Connecting to database...');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Database: ${process.env.DB_NAME || 'space_strike'}`);
        console.log(`   User: ${process.env.DB_USER || 'postgres'}\n`);

        await client.connect();
        console.log('✅ Connected to database\n');

        // Read schema file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        console.log('📖 Reading schema file...');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('✅ Schema file loaded\n');

        // Execute schema
        console.log('⚙️  Executing schema...');
        await client.query(schema);
        console.log('✅ Schema executed successfully\n');

        // Verify tables created
        console.log('🔍 Verifying tables...');
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        console.log('✅ Tables created:');
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

        console.log('\n🎉 Database setup complete!');
        console.log('\nNext steps:');
        console.log('1. Run: npm start');
        console.log('2. Open: http://localhost:3000/api/health');
        console.log('3. Test registration: http://localhost:5500/register.html\n');

    } catch (error) {
        console.error('❌ Error during database setup:');
        console.error(error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Tips:');
            console.log('   - Check if PostgreSQL is running');
            console.log('   - Verify DB_HOST and DB_PORT in .env');
            console.log('   - Check firewall settings');
        } else if (error.code === '28P01') {
            console.log('\n💡 Tips:');
            console.log('   - Verify DB_USER and DB_PASSWORD in .env');
            console.log('   - Check PostgreSQL authentication settings');
        } else if (error.code === '3D000') {
            console.log('\n💡 Tips:');
            console.log('   - Create the database first:');
            console.log('     CREATE DATABASE space_strike;');
        }
        
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run setup
setupDatabase();
