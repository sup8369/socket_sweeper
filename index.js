const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 7701;
var users = [],
  allusers = [],
  cursors = [],
  allusername = [],
  alluserscore = [0],
  blockOpened = 0,
  servBoard = new Array(60),
  gameBoard = new Array(60),
  checkBoard = new Array(60),
  userBoard = new Array(60),
  frArea = [];
function resetting() {
  io.emit("reset");
  initializing();
}
setInterval(resetting, 1000 * 60 * 60);
function initializing() {
  (allusername = []), (users = []), (frArea = []);
  (alluserscore = []), (allusers = []), (cursors = []), (blockOpened = 0);
  for (i = 0; i < 60; i++) {
    gameBoard[i] = new Array(32);
    userBoard[i] = new Array(32);
    servBoard[i] = new Array(32);
    checkBoard[i] = new Array(32);
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
      debug += servBoard[j][i] === -2 ? "x" : "o";
    }
    console.log(debug);
  }

  console.log("INITIALIZED SUCCESSFULLY. CURRENT RATIO: " + (60 * 32) / 360);
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
function process(x, y, io, a) {
  if (x < 0 || x > 59 || y < 0 || y > 31 || checkBoard[x][y] == 1) return;
  checkBoard[x][y] = 1;
  var mine_num = 0;
  for (var i = x - 1; i <= x + 1; i++) {
    for (var j = y - 1; j <= y + 1; j++) {
      if (i < 0 || i > 59 || j < 0 || j > 31) continue;
      if (servBoard[i][j] == -2) {
        mine_num++;
      }
    }
  }
  if (mine_num > 0) {
    gameBoard[x][y] = mine_num + 1;
    io.emit("setflag", { pos: `${x},${y}`, res: mine_num });
    frArea[a]++;
    return;
  } else {
    gameBoard[x][y] = 1;

    io.emit("setflag", { pos: `${x},${y}`, res: 0 });
    frArea[a]++;
    for (var i = x - 1; i <= x + 1; i++) {
      for (var j = y - 1; j <= y + 1; j++) {
        process(i, j, io, a);
      }
    }
  }
}
io.on("connection", function(socket) {
  console.log("[+] " + socket.id);
  users.push(socket.id);
  allusers.push(socket.id);
  socket.emit("init", { idx: allusers.indexOf(socket.id), svd: gameBoard });
  io.emit("joined", {
    cnt: io.engine.clientsCount,
    v: users,
    av: allusers,
    avs: alluserscore,
    avn: allusername
  });
  console.log(alluserscore);

  socket.on("naming", function(e) {
    console.log(e);
    allusername[allusers.indexOf(socket.id)] = e;
    alluserscore[allusers.indexOf(socket.id)] = 0;
    io.emit("usernaming", allusername);
  });
  socket.on("findz", function(e) {
    var sp = e.split(",");

    var resSign = "";
    console.log("FINDZREQ:", sp);
    if (gameBoard[parseInt(sp[0])][parseInt(sp[1])] === 0) {
      if (servBoard[parseInt(sp[0])][parseInt(sp[1])] === -2) {
        gameBoard[parseInt(sp[0])][parseInt(sp[1])] = -2;
        resSign = "💣";

        io.emit("setflag", { pos: e, res: resSign });
        alluserscore[allusers.indexOf(socket.id)] -= 10;
        io.emit("scorepath", alluserscore);
        socket.emit("scoreget", "*10");
      } else {
        var a = Math.floor(Math.random() * 60000);
        frArea[a] = 0;
        process(parseInt(sp[0]), parseInt(sp[1]), io, a);
        alluserscore[allusers.indexOf(socket.id)] += frArea[a];
        io.emit("scorepath", alluserscore);
        socket.emit("scoreget", "+" + frArea[a]);
      }
    }
  });
  socket.on("flaged", function(e) {
    if (e.length < 2) return;
    var sp = e.split(",");
    var resSign = "";
    console.log("FLAGREQ:", sp);
    if (gameBoard[parseInt(sp[0])][parseInt(sp[1])] === 0) {
      if (servBoard[parseInt(sp[0])][parseInt(sp[1])] === -2) {
        gameBoard[parseInt(sp[0])][parseInt(sp[1])] = -1;
        resSign = "🚩";
        alluserscore[allusers.indexOf(socket.id)] += 2;
        io.emit("scorepath", alluserscore);
        socket.emit("scoreget", "/2");
        io.emit("scorepath", alluserscore);
        io.emit("setflag", { pos: e, res: resSign });
      } else {
        io.emit("scorepath", alluserscore);
        socket.emit("scoreget", "-5");
        alluserscore[allusers.indexOf(socket.id)] -= 5;
      }
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
