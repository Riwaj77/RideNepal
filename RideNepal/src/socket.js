import { io } from 'socket.io-client';

export const socket = io('http://localhost:4001', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: true
});

socket.on('connect', () => {
    console.log('Connected to socket server with ID:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected from socket server:', reason);
}); 