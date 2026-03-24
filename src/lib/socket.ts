import { io } from 'socket.io-client';
import { API_URL } from './api';

export const socket = io(API_URL, {
  autoConnect: false,
});

let joinedRooms = new Set<string>();

socket.on('connect', () => {
  joinedRooms.clear();
  console.log("Socket physical connection established - rooms cleared");
});

socket.on('disconnect', () => {
  joinedRooms.clear();
});

export const atomicEmit = (event: string, payload: any) => {
  if (event === 'join' || event === 'join_group') {
    const key = `${event}:${payload}`;
    if (joinedRooms.has(key)) return;
    joinedRooms.add(key);
  }
  socket.emit(event, payload);
};
