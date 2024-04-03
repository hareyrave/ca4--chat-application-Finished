const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 3000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

// We use a set to store active users
const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  // Emit chat history to the new user
  socket.emit("history", chatHistory);

  socket.on("new user", function (username) {
    socket.username = username;
    activeUsers.add(username);
    io.emit("active users", Array.from(activeUsers));
  });

  socket.on("disconnect", function () {
    const disconnectedUser = socket.username;
    activeUsers.delete(disconnectedUser);
    io.emit("user disconnected", disconnectedUser);
  });

  socket.on("new message", function (data) {
    io.emit("new message", data);
    chatHistory.push(data); // Add the message to chat history
  });

  socket.on("change username", function (newUsername) {
    const previousUsername = socket.username;
    activeUsers.delete(previousUsername);
    socket.username = newUsername;
    activeUsers.add(newUsername);
    io.emit("change username", { previousUsername, newUsername, activeUsers: Array.from(activeUsers) });
  });
});

// Store chat history
const chatHistory = [];

// Middleware to intercept chat messages and add them to chat history
io.use((socket, next) => {
  socket.on("new message", function (data) {
    chatHistory.push(data);
  });
  next();
});

