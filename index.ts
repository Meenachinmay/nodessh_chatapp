import * as ssh2 from "ssh2";
import * as fs from "fs";
import { handleShell } from "./chatManager"; // this function will be defined in chatManager.ts

export const initSshServer = () => {
  const server = new ssh2.Server(
    {
      hostKeys: [fs.readFileSync("./ssh-keys/my_host_ed25519_key")],
    },
    (client) => {
      client
        .on("authentication", (ctx) => {
          ctx.accept();
        })
        .on("ready", () => {
          client.on("session", (accept, reject) => {
            const session = accept();
            session.on("shell", (accept, reject) => {
              const stream = accept();
              handleShell(stream); // Delegate to chatManager
            });
          });
        });
    }
  ).listen(4000, () => {
    console.log("SSH server listening on port 4000");
  });
};

initSshServer();