import { ServerChannel } from "ssh2";

interface Clients {
  [username: string]: ServerChannel;
}

interface Rooms {
  [roomName: string]: string[];
}

const rooms: Rooms = {}; // Stores chat rooms and connected clients
const clients: Clients = {}; // Stores client information

export const handleShell = (stream: ServerChannel) => {
  stream.write("Welcome! Please enter your name: ");

  let username = "";
  let roomName = "";
  let stage = 0; // 0: entering username, 1: selecting room

  stream.on("data", (data: any) => {
    const strData = data.toString().trim();
    if (stage === 0) {
      username = strData;
      clients[username] = stream;
      stream.write(`Welcome ${username}, please enter room name: `);
      stage = 1;
    } else if (stage === 1) {
      roomName = strData;
      if (!rooms[roomName]) {
        rooms[roomName] = [];
      }
      rooms[roomName].push(username);
      stream.write(`Joined room ${roomName}. Start chatting!\n`);
      stage = 2;
    } else {
      // Broadcast message to others in the same room
      rooms[roomName].forEach((user) => {
        if (user !== username) {
          clients[user].write(`${username}: ${strData}\n`);
        }
      });
    }
  });
};
