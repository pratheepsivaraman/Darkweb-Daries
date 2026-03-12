const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);

        const username = 'admin';
        const email = 'admin@darkweb.com';
        const passwordText = 'admin123';

        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('Admin user already exists. Updating role to admin...');
            userExists.role = 'admin';
            userExists.puzzleSolved = true;
            await userExists.save();
            console.log('User upgraded to admin.');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(passwordText, salt);

            await User.create({
                username,
                email,
                password: hashedPassword,
                role: 'admin',
                puzzleSolved: true
            });
            console.log('Admin user created successfully.');
        }

        console.log(`Username: ${username}`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${passwordText}`);

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

createAdmin();
