const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const updateUserRole = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'mdzishan24680@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save({ validateBeforeSave: false });
        console.log(`Updated user ${email} role to 'admin'`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateUserRole();
