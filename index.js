const express = require('express');
const socket = require("socket.io");
const app = express();

app.use(express.static("public"));

let server = app.listen(3000, () => {
  console.log('Node server started...');
});

let io = socket(server);

let leaderboard = {
};

let max = 0;

io.on("connection", socket => {
  socket.on("score", data => {
      leaderboard[data.id] = {
        name: data.name,
        score: data.counter,
        id: data.id,
        finale: data.done
      };
    console.log(leaderboard);
    io.sockets.emit("leaderboard", leaderboard);
  });
  socket.on("message", data => {
    io.sockets.emit("message", data);
  });
});

function expo(x, f) {
  return Number.parseFloat(x).toExponential(f);
}