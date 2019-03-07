"use strict";

(function() {
  /* Initializing */
  var socket = io();

  var socket_local_id = -1;
  var infoBoard = document.getElementsByClassName("InfoBoard");
  var title = document.getElementsByClassName("title");
  var lastClicked;
  var multiClicked = [];
  socket.on("init", function(e) {
    socket_local_id = e.idx;
    for (var i = 0; i < 60; i++) {
      for (var j = 0; j < 32; j++) {
        console.log(e.svd[i][j]);
        if (e.svd[i][j] !== 0) {
          if (e.svd[i][j] === -1) {
            document.getElementById(`${i},${j}`).innerHTML = "🚩";
          } else if (e.svd[i][j] === -2) {
            document.getElementById(`${i},${j}`).innerHTML = "💣";
          } else {
            document.getElementById(`${i},${j}`).innerHTML = e.svd[i][j] - 1;
          }
        }
      }
    }
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

  /* On SocketBroad */
  socket.on("setflag", function(e) {
    var _ = document.getElementById(e.pos);
    _.innerHTML = e.res;
    // _.id = "";
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
    cells[i].addEventListener("mouseup", cl, false);
    cells[i].addEventListener("mousedown", bold, false);
    cells[i].addEventListener("contextmenu", rcl, false);
  }

  /* Cells Hover Event */
  function mv(e) {
    socket.emit("hover", { pos: e.srcElement.id, idx: socket_local_id });
  }

  /* Cells Select Highlight */
  function bold(e) {
    lastClicked = e.target;
    multiClicked.push(e.target);
    e.target.style.backgroundColor = "#777";
  }

  /* Cells Click Event */
  function cl(e) {
    for (i = 0; i < multiClicked.length; i++)
      multiClicked[i].style.backgroundColor = "";
    multiClicked = [];
    if (lastClicked === e.target) {
      switch (e.which) {
        case 1:
          socket.emit("findz", e.target.id);
          break;
        case 3:
          socket.emit("flaged", e.target.id);
          break;
      }
    }

    console.log(e);
  }

  /* Cells RightClick Event */
  function rcl(e) {
    e.preventDefault();
  }
})();
