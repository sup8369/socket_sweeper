const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
var users = [];
var cursors = [];
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  await res.render("index", {
    title: "Your SocketID"
  });
});
app.use(express.static(__dirname + "/public"));

function onConnection(socket) {
  socket.on("drawing", data => socket.broadcast.emit("drawing", data));
}
Array.prototype.remove = function() {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

io.on("connection", function(socket) {
  console.log("[+] " + socket.id);
  users.push(socket.id);
  io.emit("joined", {
    cnt: io.engine.clientsCount,
    v: users
  });

  socket.on("disconnect", function() {
    console.log("[-] " + socket.id);
    cursors[users.indexOf(socket.id)] = null;
    users.remove(socket.id);
    io.emit("inhover", { cursors });
    io.emit("joined", {
      cnt: io.engine.clientsCount,
      v: users
    });
  });

  socket.on("hover", function(data) {
    cursors[data.idx] = data.pos;
    io.emit("inhover", { cursors });
    console.log(data.idx, data.pos);
  });
});

http.listen(port, () => console.log("listening on port " + port));
