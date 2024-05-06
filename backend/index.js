const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const https = require('https');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

mongoose.connect('mongodb+srv://tkyskii2004:5yflnhPI3YCkU9Zf@cluster0.cbsjesv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.log('Error:', error));

const routes = require('./routes/routes');
app.use('/', routes);

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('taskUpdate', (taskId) => {
    console.log('Received task update request for task:', taskId.taskId);
    io.emit('taskUpdateFront', taskId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

