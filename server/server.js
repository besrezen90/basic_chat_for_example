const express = require("express");
const path = require("path");
const socket = require("socket.io");
const http = require("http");

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3030;

const app = express();
const server = http.createServer(app);
const io = socket(server);

const message = (name, text) => {
	return { name, text };
};

app.use(express.static(publicPath));

server.listen(port, () => console.log(`Server has been start on port ${port}`));

io.on("connection", socket => {
	console.log("io connection");
	socket.on("message:create", (data, callback) => {
		if (!data) {
			callback(`Message can't be empty`);
		} else {
			io.emit("message:new", message("Admin", data.text));
			callback();
		}
	});
});
