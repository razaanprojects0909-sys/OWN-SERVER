const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", // Production me specific domain daalein
      methods: ["GET", "POST"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log('🔌 Admin connected:', socket.id);
    
    // Admin panel join karega 'admin-room' me
    socket.on('admin-join', (projectId) => {
      socket.join(`admin-${projectId}`);
      console.log(`📡 Admin joined room: admin-${projectId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Admin disconnected:', socket.id);
    });
  });
  
  return io;
};

// Realtime data bhejne ka function
const emitNewSubmission = (projectId, data) => {
  if (io) {
    io.to(`admin-${projectId}`).emit('new-submission', data);
    console.log(`📤 Emitted new submission to admin-${projectId}`);
  }
};

module.exports = { initSocket, emitNewSubmission };