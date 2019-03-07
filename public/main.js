"use strict";

(function() {
  var socket = io();
  var socket_local_id;
  var infoBoard = document.getElementsByClassName("InfoBoard"),
    title = document.getElementsByClassName("title");
  socket.on("joined", function(e) {
    title[0].innerHTML = `socket Id: ${socket.id} (online: ${e.cnt})`;
    socket_local_id = e.v.indexOf(socket.id);
    var strv = "";
    e.v.forEach(function(x, index) {
      strv += `<div class="row">${index + 1}. ${x.substring(0, 5)}...</div>`;
    });
    infoBoard[0].innerHTML = strv;
  });
  socket.on("inhover", function(e) {
    var hovcells = document.getElementsByClassName("hov");

    while (document.getElementsByClassName("hov").length !== 0)
      for (var i = 0; i < hovcells.length; i++) hovcells[i].className = "cell";
    var hovcells = document.getElementsByClassName("hov");
    for (var i = 0; i < e.cursors.length; i++) {
      e.cursors[i] !== null
        ? (document.getElementById(e.cursors[i]).className = `cell hov co${i %
            8}`)
        : "";
    }
    console.log(e.cursors);
  });
  var cells = document.getElementsByClassName("cell");
  for (var i = 0; i < cells.length; i++) {
    cells[i].addEventListener("mouseover", mv, false);
  }
  function mv(e) {
    socket.emit("hover", { pos: e.srcElement.id, idx: socket_local_id });
  }
})();
