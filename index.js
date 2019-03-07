const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
var users = [];
var allusers = [];
var cursors = [];
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  await res.render("index");
});
app.use(express.static(__dirname + "/public"));

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
  allusers.push(socket.id);
  socket.emit("init", allusers.indexOf(socket.id));
  io.emit("joined", {
    cnt: io.engine.clientsCount,
    v: users
  });

  socket.on("disconnect", function() {
    console.log("[-] " + socket.id);
    cursors[allusers.indexOf(socket.id)] = null;
    users.remove(socket.id);
    const rec = [];
    cursors.forEach(function(x, index) {
      if (x !== null) rec.push(`${index}x${x}`);
    });
    io.emit("inhover", { cursors: rec });
    io.emit("joined", {
      cnt: io.engine.clientsCount,
      v: users
    });
  });

  socket.on("hover", function(data) {
    cursors[data.idx] = data.pos;
    const rec = [];
    cursors.forEach(function(x, index) {
      if (x !== null) rec.push(`${index}x${x}`);
    });
    io.emit("inhover", { cursors: rec });
    console.log(data.idx, data.pos);
  });
});

http.listen(port, () => console.log("listening on port " + port));
