import * as ssh2 from "ssh2";
import * as fs from "fs";

interface Clients {
  [username: string]: ssh2.ServerChannel;
}

interface Rooms {
  [roomName: string]: string[];
}

const rooms: Rooms = {}; // Stores chat rooms and connected clients
const clients: Clients = {}; // Stores client information

const server = new ssh2.Server(
  {
    hostKeys: [fs.readFileSync("/Users/meenachinmay/.ssh/my_host_ed25519_key")],
  },
  (client) => {
    client
      .on("authentication", (ctx) => {
        // For simplicity, let's accept all authentication attempts
        ctx.accept();
      })
      .on("ready", () => {
        client.on("session", (accept, reject) => {
          const session = accept();
          session
            .once("exec", (accept, reject, info) => {
              // ... handling code here ...
            })
            .on("shell", (accept, reject) => {
              const stream = accept();
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
            });
        });
      });
  }
).listen(4000, () => {
  console.log("SSH server listening on port 4000");
});
