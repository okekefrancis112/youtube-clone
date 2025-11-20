// import { db } from "@/db";
// import { categories } from "@/db/schema";

// const categoryNames = [
//     "Cars and vehicles",
//     "Comedy",
//     "Education",
//     "Gaming",
//     "Entertainment",
//     "Film and animation",
//     "How-to and style",
//     "Music",
//     "News and politics",
//     "People and blogs",
//     "Pets and animals",
//     "Science and technology",
//     "Sports",
//     "Travel and events",
// ]

// async function main() {
//     console.log("Seeding categories...");

//     try {
//         const values = categoryNames.map((name) => ({
//             name,
//             description: `Videos related to ${name.toLowerCase()}`,
//         }));

//         await db.insert(categories).values(values);

//         console.log("Categories seeded successfully.");
//     } catch (error) {
//         console.error("Error seeding categories:", error);
//         process.exit(1);
//     }
// }

// // main ();

// // Add proper error handling and connection cleanup
// main()
//     .catch((err) => {
//         console.error("Seed failed:", err);
//         process.exit(1);
//     })
//     .finally(() => {
//         process.exit(0);
//     });

// src/scripts/seed-categories-reset.ts
import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
    "Cars and vehicles",
    "Comedy",
    "Education",
    "Gaming",
    "Entertainment",
    "Film and animation",
    "How-to and style",
    "Music",
    "News and politics",
    "People and blogs",
    "Pets and animals",
    "Science and technology",
    "Sports",
    "Travel and events",
];

async function main() {
    console.log("🚀 Starting complete category reset...");
    console.log("⚠️  WARNING: This will delete ALL existing categories and insert fresh ones!\n");

    try {
        // Count existing categories before deletion
        const existingCount = await db.select().from(categories);
        console.log(`📊 Found ${existingCount.length} existing categories`);

        // Delete all categories
        console.log("🗑️  Deleting all existing categories...");
        await db.delete(categories);
        console.log("✅ Deletion completed");

        // Insert fresh categories
        console.log("📥 Inserting fresh categories...");
        const values = categoryNames.map((name) => ({
            name,
            description: `Videos related to ${name.toLowerCase()}`,
        }));

        await db.insert(categories).values(values);

        console.log("\n🎉 RESET COMPLETE!");
        console.log(`📋 Total categories inserted: ${categoryNames.length}`);
        console.log("\n📝 Category List:");
        categoryNames.forEach((name, index) => {
            console.log(`   ${index + 1}. ${name}`);
        });

    } catch (error) {
        console.error("❌ Error during reset:", error);
        process.exit(1);
    }
}

// Add a confirmation prompt for safety
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question(`⚠️  This will DELETE ALL categories and insert fresh ones. Continue? (y/N): `, (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('🔄 Starting reset...\n');
        main();
    } else {
        console.log('❌ Reset cancelled.');
        process.exit(0);
    }
    readline.close();
});