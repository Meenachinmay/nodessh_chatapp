import { ServerChannel } from "ssh2";
import * as AuthService from "./auth.service"; // Import AuthService

interface Clients {
  [username: string]: ServerChannel;
}

interface Rooms {
  [roomName: string]: string[];
}

const rooms: Rooms = {}; // Stores chat rooms and connected clients
const clients: Clients = {}; // Stores client information

export const handleShell = (stream: ServerChannel) => {
  let stage = "initial";
  let username = "";
  let password = "";
  let roomName = "";

  async function handleData(data: any) {
    const strData = data.toString().trim();

    switch (stage) {
      case "initial":
        stream.write("Welcome! 1. Login or 2. Signup\n");
        stage = "choosingAuth";
        break;

      case "choosingAuth":
        if (strData === "1") {
          stream.write("Enter username for login: ");
          stage = "loginUsername";
        } else if (strData === "2") {
          stream.write("Enter username for signup: ");
          stage = "signupUsername";
        }
        break;

      case "signupUsername":
        username = strData;
        stream.write("Enter password for signup: ");
        stage = "signupPassword";
        break;

      case "signupPassword":
        password = strData;
        await AuthService.signUp(username, password);
        stream.write("Signup successful! Now login.\n");
        stage = "initial";
        break;

      case "loginUsername":
        username = strData;
        stream.write("Enter password for login: ");
        stage = "loginPassword";
        break;

      case "loginPassword":
        password = strData;
        const user = await AuthService.login(username, password);
        if (user) {
          clients[username] = stream;
          stream.write("Login successful! Choose a room: ");
          stage = "choosingRoom";
        } else {
          stream.write("Incorrect username or password. Try again.\n");
          stage = "initial";
        }
        break;

      case "choosingRoom":
        roomName = strData;
        if (!rooms[roomName]) {
          rooms[roomName] = [];
        }
        rooms[roomName].push(username);
        stream.write(`Joined room ${roomName}. Start chatting!\n`);
        stage = "inRoom";
        break;

      case "inRoom":
        // Your chat logic here. You can also save the message to the database if needed.
        rooms[roomName].forEach((user) => {
          if (user !== username) {
            clients[user].write(`${username}: ${strData}\n`);
          }
        });
        break;
    }
  }

  stream.on("data", handleData);
};
