const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const formRoutes = require("./routes/formRoutes");  
const adminRoutes = require("./routes/adminRoutes");
const udfRoutes = require("./routes/udfRoutes");
const responseRoutes = require("./routes/ResponseRoutes");
const mailRoutes = require("./routes/mailRoutes");
const assignmentRoutes = require("./routes/assigmentRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/form", formRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/udf", udfRoutes);
app.use("/api/responses", responseRoutes); // For saving & fetching responses
app.use("/api/assignments", assignmentRoutes);
app.use("/api/mail", mailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
