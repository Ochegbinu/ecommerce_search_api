import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const esNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

export const esClient = new Client({
    node: esNode,
});

export const initElasticsearch = async () => {
    try {
        const info = await esClient.info();
        console.log('Successfully connected to Elasticsearch:', info.version.number);
    } catch (error) {
        console.error('Error connecting to Elasticsearch:', error);
   
    }
};
