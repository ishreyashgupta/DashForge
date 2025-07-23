// Sample code to seed a MongoDB database with user and form data
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");
const FormData = require("./models/FormData");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/your_db_name";

const users = [
  { name: "John Wick", email: "johnwick@continental.com", password: "wick123", role: "user" },
  { name: "Goku Son", email: "goku@dbz.com", password: "goku123", role: "user" },
  { name: "Tony Stark", email: "ironman@starkindustries.com", password: "stark123", role: "user" },
  { name: "Naruto Uzumaki", email: "naruto@konoha.com", password: "naruto123", role: "user" },
  { name: "Lara Croft", email: "lara@tombraider.com", password: "lara123", role: "user" },
  { name: "Bruce Wayne", email: "batman@wayneenterprises.com", password: "bruce123", role: "admin" },
  { name: "Levi Ackerman", email: "levi@scoutinglegion.com", password: "levi123", role: "user" },
  { name: "Hermione Granger", email: "hermione@hogwarts.edu", password: "hermione123", role: "user" },
  { name: "James Bond", email: "bond007@mi6.uk", password: "bond123", role: "user" },
  { name: "Thanos Titan", email: "thanos@infinitywar.com", password: "thanos123", role: "user" },
];

const forms = [{
    firstName: "John", lastName: "Wick", mobile: "9999999991", gender: "male",
    email: "johnwick@continental.com", maritalStatus: "Single",
    communicationAddress: { line1: "Continental Hotel", line2: "Room 302", city: "New York", pincode: "10001", state: "NY" },
    presentAddress: { line1: "Safe House", line2: "Unknown", city: "Brooklyn", pincode: "11201", state: "NY" }
  },
  {
    firstName: "Goku", lastName: "Son", mobile: "9999999992", gender: "male",
    email: "goku@dbz.com", maritalStatus: "Married",
    communicationAddress: { line1: "Mount Paozu", line2: "Gohan's House", city: "East District", pincode: "42000", state: "West City" },
    presentAddress: { line1: "Capsule Corp", line2: "Guest Room", city: "West City", pincode: "42001", state: "West City" }
  },
  {
    firstName: "Tony", lastName: "Stark", mobile: "9999999993", gender: "male",
    email: "ironman@starkindustries.com", maritalStatus: "Single",
    communicationAddress: { line1: "Stark Tower", line2: "Top Floor", city: "Manhattan", pincode: "10022", state: "NY" },
    presentAddress: { line1: "Malibu Mansion", line2: "Cliffside", city: "Malibu", pincode: "90265", state: "CA" }
  },
  {
    firstName: "Naruto", lastName: "Uzumaki", mobile: "9999999994", gender: "male",
    email: "naruto@konoha.com", maritalStatus: "Married",
    communicationAddress: { line1: "Hokage Residence", line2: "", city: "Konoha", pincode: "99999", state: "Fire Country" },
    presentAddress: { line1: "Naruto's House", line2: "Near Ichiraku", city: "Konoha", pincode: "99999", state: "Fire Country" }
  },
  {
    firstName: "Lara", lastName: "Croft", mobile: "9999999995", gender: "female",
    email: "lara@tombraider.com", maritalStatus: "Single",
    communicationAddress: { line1: "Croft Manor", line2: "", city: "Surrey", pincode: "GU10", state: "England" },
    presentAddress: { line1: "Jungle Camp", line2: "Expedition Site", city: "Amazon", pincode: "11000", state: "Brazil" }
  },
  {
    firstName: "Bruce", lastName: "Wayne", mobile: "9999999996", gender: "male",
    email: "batman@wayneenterprises.com", maritalStatus: "Single",
    communicationAddress: { line1: "Wayne Manor", line2: "Main Wing", city: "Gotham", pincode: "12345", state: "New Jersey" },
    presentAddress: { line1: "Batcave", line2: "Secret Entrance", city: "Gotham", pincode: "12346", state: "New Jersey" }
  },
  {
    firstName: "Levi", lastName: "Ackerman", mobile: "9999999997", gender: "male",
    email: "levi@scoutinglegion.com", maritalStatus: "Single",
    communicationAddress: { line1: "HQ Barracks", line2: "Survey Corps", city: "Wall Rose", pincode: "30100", state: "Paradise" },
    presentAddress: { line1: "Levi's Quarters", line2: "", city: "Shiganshina", pincode: "30101", state: "Paradise" }
  },
  {
    firstName: "Hermione", lastName: "Granger", mobile: "9999999998", gender: "female",
    email: "hermione@hogwarts.edu", maritalStatus: "Married",
    communicationAddress: { line1: "Hogwarts Castle", line2: "Gryffindor Tower", city: "Hogsmeade", pincode: "10010", state: "Scotland" },
    presentAddress: { line1: "Ministry of Magic", line2: "Office of Magical Law", city: "London", pincode: "10011", state: "England" }
  },
  {
    firstName: "James", lastName: "Bond", mobile: "9999999999", gender: "male",
    email: "bond007@mi6.uk", maritalStatus: "Single",
    communicationAddress: { line1: "MI6 HQ", line2: "Spy Division", city: "London", pincode: "SW1A", state: "England" },
    presentAddress: { line1: "Luxury Apartment", line2: "Secret Floor", city: "London", pincode: "SW1B", state: "England" }
  },
  {
    firstName: "Thanos", lastName: "Titan", mobile: "9999999900", gender: "male",
    email: "thanos@infinitywar.com", maritalStatus: "Single",
    communicationAddress: { line1: "Sanctuary II", line2: "Command Deck", city: "Titan", pincode: "00000", state: "Cosmos" },
    presentAddress: { line1: "Garden", line2: "Retirement Spot", city: "Unknown", pincode: "00001", state: "Cosmos" }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        console.log(`⚠️ User already exists: ${user.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({ ...user, password: hashedPassword });
      await newUser.save();
      console.log(`✅ User created: ${user.email}`);
    }

    for (const form of forms) {
      const user = await User.findOne({ email: form.email });
      if (!user) {
        console.log(`❌ No matching user found for form: ${form.email}`);
        continue;
      }

      const existingForm = await FormData.findOne({ userId: user._id });
      if (existingForm) {
        console.log(`⚠️ Form already exists for: ${form.email}`);
        continue;
      }

      const newForm = new FormData({ ...form, userId: user._id });
      await newForm.save();
      console.log(`✅ Form created for: ${form.email}`);
    }

    console.log("🎉 Seeding completed without duplications");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();
