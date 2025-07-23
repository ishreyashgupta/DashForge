const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const FormData = require("../models/FormData");

// ✅ REGISTER Controller
exports.register = async (req, res) => {
  const { name, email, password, role, adminKey } = req.body;
     console.log("adminKey from client:", adminKey);
     console.log("ADMIN_SECRET from env:", process.env.ADMIN_SECRET);
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // ✅ Default role is "user"
    let finalRole = "user";

    // ✅ If trying to register as admin
    if (role === "admin") {
      if (adminKey !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin key" });
      }
      finalRole = "admin";
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create user with correct role
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ LOGIN Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Send token + user info (needed for frontend role check)
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ GET DASHBOARD Controller
exports.getDashboard = async (req, res) => {
  try {
    const form = await FormData.findOne({ userId: req.user._id });

    res.json({
      user: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      formFilled: !!form,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
