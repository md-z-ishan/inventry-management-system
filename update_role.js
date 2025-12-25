const mongoose = require('mongoose');
const User = require('./backend/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const updateUserRole = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'admin@example.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save({ validateBeforeSave: false });
        console.log(`Updated user ${email} role to 'admin'`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateUserRole();
