import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/mongodb.js';
import { initElasticsearch } from './config/elasticsearch.js';
import { createProductIndex } from './services/search.service.js';
import productRoutes from './routes/product.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', productRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Ecommerce Search API');
});

const startServer = async () => {
    try {
        await connectToDatabase();
        await initElasticsearch();
        await createProductIndex();
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
