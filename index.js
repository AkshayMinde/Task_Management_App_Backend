const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const flash = require('flash');
const http = require('http');
const socketIO = require('socket.io');
dotenv.config();
const bodyParser = require("body-parser");


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_DB_URI)
.then(() => {
    console.log('database connected');
})
.catch((error) => {
    console.log(error);
});

app.use((req, res, next) => {
    // Pass io to your routes
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('taskCreated', (newTask) => {
        console.log('New task created:', newTask);
    });

    socket.on('taskUpdated', (updatedTask) => {
        console.log('Task updated:', updatedTask);
    });

    socket.on('taskDeleted', (deletedTask) => {
        console.log('Task deleted:', deletedTask);
    });
    
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Working');
});



const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');

app.use(authRoutes);
app.use(taskRoutes);

const port = process.env.PORT || 5000;
app.listen(port, (req, res) => {
    console.log(`Server is working`);
});
