const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");
const materialRoutes = require("./src/routes/materialRoutes");
const workerRoutes = require("./src/routes/workerRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const dailyReportRoutes = require("./src/routes/dailyReportRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const progressRoutes = require("./src/routes/progressRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/daily-reports", dailyReportRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/progress", progressRoutes);

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "Construction Management API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
