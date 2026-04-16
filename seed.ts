import { connectToDatabase } from './src/config/mongodb.js';
import { indexProduct, createProductIndex } from './src/services/search.service.js';

const sampleProducts = [
    {
        title: "Plot T-Shirt",
        brand: "Lee Cooper",
        description: "Red cotton half sleeve t-shirt",
        section: "fashion",
        category: "tshirt",
        sub_category: "half-sleeve",
        tags: ["red", "cotton", "men"],
        price: "343USD",
        color: "red"
    },
    {
        title: "Levis Jeans 501",
        brand: "Levis",
        description: "Classic blue denim jeans",
        section: "fashion",
        category: "jeans",
        sub_category: "straight-fit",
        tags: ["blue", "denim", "men"],
        price: "599USD",
        color: "blue"
    },
    {
        title: "Cotton White Shirt",
        brand: "Zara",
        description: "Formal white cotton shirt for men",
        section: "fashion",
        category: "shirt",
        sub_category: "formal",
        tags: ["white", "cotton", "formal"],
        price: "450USD",
        color: "white"
    },
    {
        title: "Puma Sneakers",
        brand: "Puma",
        description: "Lightweight running shoes",
        section: "fashion",
        category: "shoes",
        sub_category: "casual",
        tags: ["black", "running", "sport"],
        price: "700USD",
        color: "black"
    },
    {
        title: "Silk Kurta",
        brand: "Manyavar",
        description: "Elegant silk kurta for traditional occasions",
        section: "ethnic",
        category: "kurta",
        sub_category: "traditional",
        tags: ["silk", "yellow", "wedding"],
        price: "1200USD",
        color: "yellow"
    }
];

const seed = async () => {
    try {
        const db = await connectToDatabase();
        await createProductIndex();
        
        console.log('Seeding products...');
        const collection = db.collection('products');
        
        // Clear existing data
        await collection.deleteMany({});
        
        for (const product of sampleProducts) {
            const res = await collection.insertOne({
                ...product,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            
            await indexProduct({
                ...product,
                _id: res.insertedId.toString()
            });
            console.log(`Indexed: ${product.title}`);
        }
        
        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
