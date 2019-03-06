const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
var temp = "N",
  socket_id = "N";

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

io.on("connection", onConnection);

http.listen(port, () => console.log("listening on port " + port));
