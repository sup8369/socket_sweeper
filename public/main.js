"use strict";

(function() {
  /* Initializing */
  var socket = io();

  var socket_local_id = -1;
  var infoBoard = document.getElementsByClassName("InfoBoard");
  var title = document.getElementsByClassName("title");

  socket.on("init", function(e) {
    socket_local_id = e;
  });

  /* Player Joined */
  socket.on("joined", function(e) {
    title[0].innerHTML = `socket Id: ${
      socket.id
    }[${socket_local_id}] (online: ${e.cnt})`;
    var strv = "";
    e.v.forEach((x, index) => {
      strv += `<div class="row">${index + 1}. ${x.substring(0, 5)}...</div>`;
    });
    infoBoard[0].innerHTML = strv;
  });

  /* Players On Hover */
  socket.on("inhover", function(e) {
    while (document.getElementsByClassName("hov").length !== 0) {
      var hovcells = document.getElementsByClassName("hov");
      for (var i = 0; i < hovcells.length; i++) hovcells[i].className = "cell";
    }
    console.log(e.cursors);
    for (var i = 0; i < e.cursors.length; i++) {
      if (e.cursors[i] === null) continue;
      var spl = e.cursors[i].split("x");
      document.getElementById(spl[1]).className = `cell hov co${spl[0] % 8}`;
    }
  });

  /* Cells Event Registration */
  var cells = document.getElementsByClassName("cell");
  for (var i = 0; i < cells.length; i++) {
    cells[i].addEventListener("mouseover", mv, false);
  }

  /* Cells Hover Event */
  function mv(e) {
    socket.emit("hover", { pos: e.srcElement.id, idx: socket_local_id });
  }
})();
