import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'ecommerce_search_api';

let client: MongoClient;
let db: Db;

export const connectToDatabase = async (): Promise<Db> => {
    if (db) return db;

    try {
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        await client.connect();
        db = client.db(dbName);
        console.log('Successfully connected to MongoDB');
        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

export const getDb = (): Db => {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
};
