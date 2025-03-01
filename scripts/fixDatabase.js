const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGO_URI;
const baseUri = uri.split('/')[0] + '//' + uri.split('/')[2];

async function fixDatabase() {
    try {
        // First connect to admin database to list all databases
        const adminConnection = await mongoose.createConnection(baseUri + '/admin');
        
        // List all databases
        const dbs = await adminConnection.db.admin().listDatabases();
        
        // Find and delete test database if it exists
        const testDb = dbs.databases.find(db => db.name === 'test');
        if (testDb) {
            console.log('Found test database, deleting...');
            await adminConnection.db.admin().command({ dropDatabase: 'test' });
            console.log('Successfully deleted test database');
        } else {
            console.log('No test database found');
        }

        // Close admin connection
        await adminConnection.close();

        // Now connect to e-commerce database
        const ecommerceConnection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // List all collections in e-commerce database
        const collections = await ecommerceConnection.connection.db.listCollections().toArray();
        console.log('\nCollections in e-commerce database:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        console.log('\nSuccessfully connected to e-commerce database');
        
        // Close connection
        await mongoose.connection.close();
        
        console.log('Database fix completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing database:', error);
        process.exit(1);
    }
}

fixDatabase();
