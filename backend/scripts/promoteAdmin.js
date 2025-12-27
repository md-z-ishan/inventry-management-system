const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const promoteUser = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Please provide an email address');
        console.log('Usage: node scripts/promoteAdmin.js <email>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User not found: ${email}`);
            process.exit(1);
        }

        user.role = 'admin';
        user.isAdmin = true;
        await user.save({ validateBeforeSave: false });

        console.log(`✅ SUCCESS: ${user.name} (${user.email}) is now an ADMIN.`);
        console.log('   - Role: admin');
        console.log('   - isAdmin: true');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

promoteUser();
