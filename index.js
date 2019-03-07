const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
var users = [],
  allusers = [],
  cursors = [],
  blockOpened = 0,
  servBoard = new Array(60),
  gameBoard = new Array(60),
  userBoard = new Array(60);

function initializing() {
  (users = []), (allusers = []), (cursors = []), (blockOpened = 0);
  for (i = 0; i < 60; i++) {
    gameBoard[i] = new Array(32);
    userBoard[i] = new Array(32);
    servBoard[i] = new Array(32);
    for (j = 0; j < 32; j++) {
      gameBoard[i][j] = 0;
      userBoard[i][j] = "";
      servBoard[i][j] = 0;
    }
  }

  for (i = 0; i < 360; i++) {
    var a, b;
    while (1) {
      a = Math.floor(Math.random() * 60);
      b = Math.floor(Math.random() * 32);
      if (b > 1 && b < 13 && a > 53) continue;
      if (servBoard[a][b] !== -2) {
        servBoard[a][b] = -2;
        break;
      }
    }
  }
  // 1x1    60x1
  // 1x32   60x32
  var debug = "";
  for (i = 0; i < 32; i++) {
    debug = "";
    for (j = 0; j < 60; j++) {
      if (i > 1 && i < 13 && j > 53) {
        debug += " ";
        continue;
      }
      debug += servBoard[j][i] === -2 ? "x" : "o";
    }
    console.log(debug);
  }

  console.log("INITIALIZED SUCCESSFULLY.");
}
initializing();
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
  socket.on("flaged", function(e) {
    var sp = e.split(",");
    var resSign = "";
    console.log("FLAGREQ:", sp);
    if (gameBoard[parseInt(sp[0]) - 1][parseInt(sp[1]) - 1] === 0) {
      if (servBoard[parseInt(sp[0]) - 1][parseInt(sp[1]) - 1] === -2) {
        gameBoard[parseInt(sp[0]) - 1][parseInt(sp[1]) - 1] = -1;
        resSign = "🚩";
      } else {
        //gameBoard[parseInt(sp[0]) - 1][parseInt(sp[1]) - 1] = -2;
        //resSign = "💣";
        //remove life
      }
      io.emit("setflag", { pos: e, res: resSign });
    }
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
    //console.log(data.idx, data.pos);
  });
});

http.listen(port, () => console.log("listening on port " + port));
