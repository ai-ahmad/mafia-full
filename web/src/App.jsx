// App.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');  // Backend serverga ulanish

const App = () => {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Yangi room yaratishdan oldin, serverdan roomlar ro'yxatini olish
    socket.emit('getRooms');
    
    socket.on('roomCreated', (newRoom) => {
      setRooms((prevRooms) => [...prevRooms, newRoom]);
    });

    socket.on('userJoined', (userId) => {
      console.log(`${userId} joined the room`);
    });

    socket.on('error', (errorMsg) => {
      alert(errorMsg);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('userJoined');
      socket.off('error');
    };
  }, []);

  const createRoom = () => {
    if (roomName.trim() !== '') {
      socket.emit('createRoom', roomName);
      setRoomName('');
    }
  };

  const joinRoom = (room) => {
    socket.emit('joinRoom', room);
  };

  return (
    <div>
      <h1>Mafia Game Rooms</h1>
      
      <input
        type="text"
        placeholder="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button onClick={createRoom}>Create Room</button>

      <h2>Available Rooms</h2>
      <ul>
        {rooms.map((room, index) => (
          <li key={index}>
            <button onClick={() => joinRoom(room)}>{room}</button>
          </li>
        ))}
      </ul>

      {userId && <h3>Joined Room: {userId}</h3>}
    </div>
  );
};

export default App;
