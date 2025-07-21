
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Drawing event
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });

  // Clear event
  socket.on('clear', () => {
    io.emit('clear');
  });

  // Image event
  socket.on('image', (imageData) => {
    socket.broadcast.emit('image', imageData);
  });

  // Image update event (move/resize)
  socket.on('imageUpdate', (updateData) => {
    socket.broadcast.emit('imageUpdate', updateData);
  });

  // Text event
  socket.on('text', (textData) => {
    socket.broadcast.emit('text', textData);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
