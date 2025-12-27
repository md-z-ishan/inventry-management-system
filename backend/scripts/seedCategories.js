const dotenv = require('dotenv');
const Category = require('../models/Category');
const User = require('../models/User');
const connectDB = require('../config/database');

const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Default categories for an inventory system
const categories = [
    {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        code: 'ELEC'
    },
    {
        name: 'Grocery',
        description: 'Food and grocery items',
        code: 'GROC'
    },
    {
        name: 'Medicine',
        description: 'Pharmaceutical and medical supplies',
        code: 'MED'
    },
    {
        name: 'Clothing',
        description: 'Apparel and fashion items',
        code: 'CLTH'
    }
];

const seedCategories = async () => {
    try {
        await connectDB();

        // Get the first user ID as createdBy (or create an admin user)
        const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();

        if (!adminUser) {
            console.error('❌ No users found in the database. Please create a user first.');
            process.exit(1);
        }

        console.log(`📝 Seeding categories with createdBy: ${adminUser.name} (${adminUser.email})`);

        // Clear existing categories
        await Category.deleteMany({});
        console.log('🗑️  Cleared existing categories');

        // Insert categories with createdBy field
        const categoriesWithUser = categories.map(cat => ({
            ...cat,
            createdBy: adminUser._id
        }));

        await Category.insertMany(categoriesWithUser);
        console.log('✅ Default categories seeded successfully!');
        console.log('\nCategories added:');
        categories.forEach(cat => console.log(`  - ${cat.name} (${cat.code}): ${cat.description}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
};

// Run the seeder
seedCategories();
