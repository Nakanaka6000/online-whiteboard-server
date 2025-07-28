
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

let drawnElements = []; // Stores the current state of the whiteboard

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send current state to the newly connected client
  socket.emit('initialState', drawnElements);

  // Drawing event
  socket.on('drawing', (data) => {
    // Update server state (for paths, we need to reconstruct them)
    if (data.type === 'start') {
      socket.currentPath = [data];
    } else if (data.type === 'draw') {
      if (socket.currentPath) socket.currentPath.push(data);
    } else if (data.type === 'stop') {
      if (socket.currentPath) {
        drawnElements.push({ type: 'path', path: socket.currentPath, strokeColor: data.strokeColor, strokeWidth: data.strokeWidth, tool: data.tool });
        socket.currentPath = [];
      }
    }
    socket.broadcast.emit('drawing', data);
  });

  // Clear event
  socket.on('clear', () => {
    drawnElements = []; // Clear server state
    io.emit('clear');
  });

  // Image event
  socket.on('image', (imageData) => {
    drawnElements.push(imageData); // Add image to server state
    socket.broadcast.emit('image', imageData);
  });

  // Element update event (move/resize)
  socket.on('elementUpdate', (updateData) => {
    const elementToUpdate = drawnElements.find(el => el.id === updateData.id);
    if (elementToUpdate) {
      elementToUpdate.x = updateData.x;
      elementToUpdate.y = updateData.y;
      if (updateData.width !== undefined) elementToUpdate.width = updateData.width;
      if (updateData.height !== undefined) elementToUpdate.height = updateData.height;
    }
    socket.broadcast.emit('elementUpdate', updateData);
  });

  // Text event
  socket.on('text', (textData) => {
    drawnElements.push(textData); // Add text to server state
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
