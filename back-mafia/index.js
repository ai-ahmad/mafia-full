// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};  // Xonalar va ularga tegishli foydalanuvchilar

// Home sahifasi (roomlar ro'yxati)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.IO eventlar
io.on('connection', (socket) => {
  console.log('a user connected');

  // Yangi room yaratish
  socket.on('createRoom', (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = [];
      console.log(`Room "${roomName}" created`);
      socket.emit('roomCreated', roomName);  // Clientga xabar yuborish
    } else {
      socket.emit('error', 'Room already exists');
    }
  });

  // Roomga kirish
  socket.on('joinRoom', (roomName) => {
    if (rooms[roomName]) {
      socket.join(roomName);
      rooms[roomName].push(socket.id);
      io.to(roomName).emit('userJoined', socket.id);
      console.log(`User ${socket.id} joined room "${roomName}"`);
    } else {
      socket.emit('error', 'Room does not exist');
    }
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('user disconnected');
    // Foydalanuvchi ketganidan keyin roomdan chiqarish
    for (let roomName in rooms) {
      rooms[roomName] = rooms[roomName].filter(id => id !== socket.id);
      if (rooms[roomName].length === 0) {
        delete rooms[roomName];  // Bo'sh roomni o'chirish
      }
    }
  });
});

// Serverni ishga tushirish
server.listen(3000, () => {
  console.log('listening on *:3000');
});
