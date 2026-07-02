require('dotenv').config({ path: 'C:/Users/swaya/Desktop/FinnovaX/node_service/.env' });
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    name: String
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log("USERS IN DB:");
    users.forEach(u => console.log(`- ${u.email} (${u.name})`));
    process.exit(0);
}
check();
