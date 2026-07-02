require('dotenv').config({ path: 'C:/Users/swaya/Desktop/FinnovaX/node_service/.env' });
const mongoose = require('mongoose');

// minimal schema
const UserSchema = new mongoose.Schema({
    email: String,
    passwordHash: String
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function check() {
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log("Connecting to:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    const user = await User.findOne({ email: 'investor@finnovax.com' });
    if (user) {
        console.log("User found:", user.email);
        console.log("Password hash:", user.passwordHash);
        
        const bcrypt = require('bcrypt');
        const isMatch = await bcrypt.compare('FinnovaX@2026', user.passwordHash);
        console.log("Matches FinnovaX@2026?", isMatch);
    } else {
        console.log("User not found!");
    }
    process.exit(0);
}
check();
