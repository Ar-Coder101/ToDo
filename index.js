require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 5000;


// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());


// Routers
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const taskRouter = require("./routes/task");
const groupRouter = require("./routes/group");

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/group", groupRouter);


// Non Exist Route
app.use((req, res, next) => {
    res.status(404).json({ msg: "Route not found" });
})

// Global Error Handler
app.use((error, req, res, next) => {
    console.log(error);
    const code = error.statusCode || 500;
    const msg = error.message || "Something went wrong";
    res.status(code).json({ msg });
})

const start = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(port, console.log("Server Is Running..."))
}
start();