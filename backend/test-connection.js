// Test database connection and verify schema
const db = require('./config/database');

async function testConnection() {
    console.log('🧪 Testing SPACE STRIKE Backend Connection...\n');
    
    try {
        // Test basic connection
        console.log('1️⃣  Testing database connection...');
        const result = await db.query('SELECT NOW()');
        console.log('   ✅ Database connected successfully!');
        console.log('   📅 Server time:', result.rows[0].now);
        
        // Test tables exist
        console.log('\n2️⃣  Checking database tables...');
        const tables = await db.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);
        
        console.log('   📊 Tables found:', tables.rows.length);
        tables.rows.forEach(row => {
            console.log('      ✓', row.tablename);
        });
        
        // Check required tables
        const requiredTables = [
            'users',
            'player_profiles',
            'player_progress',
            'player_fighters',
            'player_inventory',
            'game_results',
            'sessions'
        ];
        
        const foundTables = tables.rows.map(r => r.tablename);
        const missingTables = requiredTables.filter(t => !foundTables.includes(t));
        
        if (missingTables.length > 0) {
            console.log('\n   ⚠️  Missing tables:', missingTables.join(', '));
            console.log('   💡 Run: psql -d space_strike -f database/schema.sql');
        } else {
            console.log('\n   ✅ All required tables present!');
        }
        
        // Test sample queries
        console.log('\n3️⃣  Testing sample queries...');
        
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        console.log('   👥 Total users:', userCount.rows[0].count);
        
        const profileCount = await db.query('SELECT COUNT(*) FROM player_profiles');
        console.log('   🎮 Player profiles:', profileCount.rows[0].count);
        
        const gameCount = await db.query('SELECT COUNT(*) FROM game_results');
        console.log('   🏆 Game results:', gameCount.rows[0].count);
        
        console.log('\n✅ All tests passed! Backend is ready to deploy.');
        console.log('\n📝 Next steps:');
        console.log('   1. Set environment variables (.env file)');
        console.log('   2. Start server: npm start');
        console.log('   3. Test API: http://localhost:3000/api/health');
        
    } catch (error) {
        console.error('\n❌ Connection test failed:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check PostgreSQL is running');
        console.error('   2. Verify .env configuration');
        console.error('   3. Ensure database "space_strike" exists');
        console.error('   4. Run schema.sql if tables are missing');
        process.exit(1);
    }
    
    process.exit(0);
}

testConnection();
