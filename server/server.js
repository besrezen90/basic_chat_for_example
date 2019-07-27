const express = require("express");
const path = require("path");
const socket = require("socket.io");
const http = require("http");
const users = require("./users")();

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3030;

const app = express();
const server = http.createServer(app);
const io = socket(server);

const message = (name, text, id) => {
  return { name, text, id };
};

app.use(express.static(publicPath));

server.listen(port, () => console.log(`Server has been start on port ${port}`));

io.on("connection", socket => {
  socket.on("join", (user, callback) => {
    if (!user.name || !user.room) {
      return callback("Enter valid user date");
    }
    callback({ userId: socket.id });

    socket.join(user.room);

    users.add(socket.id, user.name, user.room);

    /* Только мне */
    socket.emit("message:new", message("Admin", `Welcome, ${user.name}!`));

    console.log(user);
    /* Всем пользовалетелям кроме меня */
    socket.broadcast
      .to(user.room)
      .emit("message:new", message("Admin", `${user.name} joined!`));
  });

  socket.on("message:create", (data, callback) => {
    if (!data) {
      callback(`Message can't be empty`);
    } else {
      const user = users.get(socket.id);
      if (user) {
        /* Всем пользовалетелям */
        io.to(user.room).emit(
          "message:new",
          message(data.name, data.text, data.id)
        );
      }
      callback();
    }
  });

  socket.on("disconnect", () => {
    const user = users.remove(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message:new",
        message("Admin", `${user.name} disconnected`)
      );
    }
  });
});
