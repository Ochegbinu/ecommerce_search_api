import { connectToDatabase } from './src/config/mongodb.js';
import { indexProduct, createProductIndex } from './src/services/search.service.js';
import type { Product } from './src/types/index.js';

// Expanded dataset with more realistic ecommerce products
const sampleProducts = [
    // T-Shirts
    { title: "Plot T-Shirt", brand: "Lee Cooper", description: "Red cotton half sleeve t-shirt for men", section: "fashion", category: "tshirt", sub_category: "half-sleeve", tags: ["red", "cotton", "men"], price: "343USD", color: "red" },
    { title: "Basic Black T-Shirt", brand: "H&M", description: "Classic black cotton tshirt", section: "fashion", category: "tshirt", sub_category: "casual", tags: ["black", "cotton", "men"], price: "299USD", color: "black" },
    { title: "Graphic Print Tee", brand: "Nike", description: "White cotton t-shirt with graphic print", section: "fashion", category: "tshirt", sub_category: "casual", tags: ["white", "cotton", "print", "unisex"], price: "499USD", color: "white" },
    { title: "V-Neck T-Shirt Women", brand: "Zara", description: "Pink v-neck cotton tshirt for women", section: "fashion", category: "tshirt", sub_category: "casual", tags: ["pink", "cotton", "women"], price: "399USD", color: "pink" },
    { title: "Polo T-Shirt", brand: "US Polo", description: "Navy blue polo t-shirt", section: "fashion", category: "tshirt", sub_category: "polo", tags: ["blue", "cotton", "formal", "men"], price: "699USD", color: "blue" },
    
    // Shirts
    { title: "Cotton White Shirt", brand: "Zara", description: "Formal white cotton shirt for men", section: "fashion", category: "shirt", sub_category: "formal", tags: ["white", "cotton", "formal"], price: "450USD", color: "white" },
    { title: "Linen Casual Shirt", brand: "Mango", description: "Beige linen casual shirt", section: "fashion", category: "shirt", sub_category: "casual", tags: ["beige", "linen", "men"], price: "599USD", color: "beige" },
    { title: "Checked Shirt Men", brand: "Allen Solly", description: "Blue checked cotton shirt", section: "fashion", category: "shirt", sub_category: "casual", tags: ["blue", "cotton", "checkered", "men"], price: "799USD", color: "blue" },
    { title: "Silk Formal Shirt", brand: "Arrow", description: "Gray silk formal shirt for business", section: "fashion", category: "shirt", sub_category: "formal", tags: ["gray", "silk", "formal", "men"], price: "1200USD", color: "gray" },
    { title: "Denim Shirt Women", brand: "Levi's", description: "Blue denim casual shirt for women", section: "fashion", category: "shirt", sub_category: "casual", tags: ["blue", "denim", "women"], price: "899USD", color: "blue" },
    
    // Jeans
    { title: "Levis Jeans 501", brand: "Levis", description: "Classic blue denim jeans", section: "fashion", category: "jeans", sub_category: "straight-fit", tags: ["blue", "denim", "men"], price: "599USD", color: "blue" },
    { title: "Skinny Fit Jeans", brand: "H&M", description: "Black skinny fit jeans for women", section: "fashion", category: "jeans", sub_category: "skinny", tags: ["black", "denim", "women"], price: "549USD", color: "black" },
    { title: "Ripped Jeans Men", brand: "Zara", description: "Blue ripped denim jeans", section: "fashion", category: "jeans", sub_category: "casual", tags: ["blue", "denim", "ripped", "men"], price: "799USD", color: "blue" },
    { title: "Bootcut Jeans", brand: "Wrangler", description: "Dark blue bootcut jeans", section: "fashion", category: "jeans", sub_category: "bootcut", tags: ["blue", "denim", "men"], price: "649USD", color: "blue" },
    { title: "White Jeans Women", brand: "Mango", description: "White straight fit jeans", section: "fashion", category: "jeans", sub_category: "straight-fit", tags: ["white", "denim", "women"], price: "699USD", color: "white" },
    
    // Shoes
    { title: "Puma Sneakers", brand: "Puma", description: "Lightweight running shoes", section: "fashion", category: "shoes", sub_category: "casual", tags: ["black", "running", "sport"], price: "700USD", color: "black" },
    { title: "Nike Air Max", brand: "Nike", description: "Premium athletic running shoes", section: "fashion", category: "shoes", sub_category: "running", tags: ["white", "sport", "running"], price: "1299USD", color: "white" },
    { title: "Leather Formal Shoes", brand: "Clarks", description: "Black leather formal shoes for men", section: "fashion", category: "shoes", sub_category: "formal", tags: ["black", "leather", "formal", "men"], price: "1599USD", color: "black" },
    { title: "Canvas Sneakers", brand: "Vans", description: "White canvas casual sneakers", section: "fashion", category: "shoes", sub_category: "casual", tags: ["white", "canvas", "casual", "unisex"], price: "799USD", color: "white" },
    { title: "Sandals Women", brand: "Bata", description: "Brown leather sandals for women", section: "fashion", category: "shoes", sub_category: "casual", tags: ["brown", "leather", "women"], price: "499USD", color: "brown" },
    { title: "Sports Running Shoes", brand: "Adidas", description: "Blue mesh running shoes", section: "fashion", category: "shoes", sub_category: "running", tags: ["blue", "sport", "running", "men"], price: "1099USD", color: "blue" },
    
    // Ethnic Wear
    { title: "Silk Kurta", brand: "Manyavar", description: "Elegant silk kurta for traditional occasions", section: "ethnic", category: "kurta", sub_category: "traditional", tags: ["silk", "yellow", "wedding"], price: "1200USD", color: "yellow" },
    { title: "Cotton Kurta Men", brand: "Fabindia", description: "White cotton kurta for daily wear", section: "ethnic", category: "kurta", sub_category: "casual", tags: ["white", "cotton", "men"], price: "799USD", color: "white" },
    { title: "Designer Saree", brand: "Kalyan", description: "Red silk designer saree with embroidery", section: "ethnic", category: "saree", sub_category: "traditional", tags: ["red", "silk", "women", "wedding"], price: "2500USD", color: "red" },
    { title: "Cotton Saree", brand: "Fabindia", description: "Blue cotton casual saree", section: "ethnic", category: "saree", sub_category: "casual", tags: ["blue", "cotton", "women"], price: "899USD", color: "blue" },
    { title: "Sherwani Wedding", brand: "Manyavar", description: "Cream sherwani for wedding", section: "ethnic", category: "sherwani", sub_category: "wedding", tags: ["cream", "silk", "men", "wedding"], price: "3500USD", color: "cream" },
    
    // Dresses
    { title: "Summer Dress Women", brand: "Zara", description: "Floral print summer dress", section: "fashion", category: "dress", sub_category: "casual", tags: ["floral", "cotton", "women", "summer"], price: "1299USD", color: "multicolor" },
    { title: "Evening Gown", brand: "Forever21", description: "Black evening gown for parties", section: "fashion", category: "dress", sub_category: "formal", tags: ["black", "silk", "women", "party"], price: "2199USD", color: "black" },
    { title: "Maxi Dress", brand: "H&M", description: "Blue maxi dress for women", section: "fashion", category: "dress", sub_category: "casual", tags: ["blue", "cotton", "women"], price: "899USD", color: "blue" },
    
    // Jackets & Outerwear
    { title: "Denim Jacket", brand: "Levis", description: "Classic blue denim jacket", section: "fashion", category: "jacket", sub_category: "casual", tags: ["blue", "denim", "unisex"], price: "1499USD", color: "blue" },
    { title: "Leather Jacket Men", brand: "Zara", description: "Black leather biker jacket", section: "fashion", category: "jacket", sub_category: "casual", tags: ["black", "leather", "men"], price: "2999USD", color: "black" },
    { title: "Winter Coat", brand: "Columbia", description: "Navy blue winter coat with hood", section: "fashion", category: "jacket", sub_category: "winter", tags: ["blue", "winter", "warm", "unisex"], price: "3999USD", color: "blue" },
    
    // Accessories
   { title: "Leather Wallet Men", brand: "Fossil", description: "Brown leather bifold wallet", section: "accessories", category: "wallet", sub_category: "casual", tags: ["brown", "leather", "men"], price: "899USD", color: "brown" },
    { title: "Canvas Backpack", brand: "Wildcraft", description: "Gray canvas backpack for travel", section: "accessories", category: "bag", sub_category: "casual", tags: ["gray", "canvas", "unisex"], price: "1299USD", color: "gray" },
    { title: "Sunglasses Aviator", brand: "Ray-Ban", description: "Classic black aviator sunglasses", section: "accessories", category: "sunglasses", sub_category: "casual", tags: ["black", "unisex", "classic"], price: "1999USD", color: "black" },
    { title: "Leather Belt Men", brand: "Tommy Hilfiger", description: "Black leather formal belt", section: "accessories", category: "belt", sub_category: "formal", tags: ["black", "leather", "men"], price: "599USD", color: "black" },
    { title: "Watch Analog", brand: "Titan", description: "Silver analog watch for men", section: "accessories", category: "watch", sub_category: "formal", tags: ["silver", "men", "analog"], price: "2499USD", color: "silver" },
];

const seed = async () => {
    try {
        const db = await connectToDatabase();
        await createProductIndex();
        
        console.log('Seeding products...');
        const collection = db.collection('products');
        
        // Clear existing data
        await collection.deleteMany({});
        
        let count = 0;
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
            count++;
            console.log(`[${count}/${sampleProducts.length}] Indexed: ${product.title}`);
        }
        
        console.log(`\n✅ Seeding completed successfully!`);
        console.log(`📊 Total products: ${sampleProducts.length}`);
        console.log('\n🔍 Try these searches:');
        console.log('  - "shirt" - returns all types of shirts');
        console.log('  - "cotton shirt" - prioritizes cotton shirts');
        console.log('  - "blue" - returns all blue products');
        console.log('  - "women" - returns all women products');
        console.log('  - "wedding" - returns wedding attire');
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
