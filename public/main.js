"use strict";

(function() {
  /* Initializing */
  var socket = io();

  var socket_local_id = -1;
  var infoBoard = document.getElementsByClassName("InfoBoard");
  var title = document.getElementsByClassName("title");
  var lastClicked;
  var alluser, alluserscore, allusername, currentuser;
  var multiClicked = [];
  var init = document.getElementsByClassName("initial")[0];
  init.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      var stv = event.srcElement.value + "";
      if (stv.length > 2 && stv.length < 11) {
        socket.emit("naming", stv);
        init.remove();
      }
    }
  });
  socket.on("scorepath", function(e) {
    alluserscore = e;
    var strv = "";
    currentuser.forEach((x, index) => {
      if (index > 10) return;
      if (x === socket.id) {
        strv += `<div class="row"><font color="#00ff00">${index + 1}. ${
          allusername[alluser.indexOf(x)]
        } (${
          alluserscore[alluser.indexOf(x)] === undefined
            ? "0"
            : alluserscore[alluser.indexOf(x)]
        }) </font></div>`;
      } else {
        strv += `<div class="row">${index + 1}. ${
          allusername[alluser.indexOf(x)]
        } (${
          alluserscore[alluser.indexOf(x)] === undefined
            ? "0"
            : alluserscore[alluser.indexOf(x)]
        }) </div>`;
      }
    });
    infoBoard[0].innerHTML = strv;
  });
  socket.on("usernaming", function(e) {
    allusername = e;
    var strv = "";
    currentuser.forEach((x, index) => {
      if (index > 10) return;
      if (x === socket.id) {
        strv += `<div class="row"><font color="#00ff00">${index + 1}. ${
          allusername[alluser.indexOf(x)]
        } (${
          alluserscore[alluser.indexOf(x)] === undefined
            ? "0"
            : alluserscore[alluser.indexOf(x)]
        }) </font></div>`;
      } else {
        strv += `<div class="row">${index + 1}. ${
          allusername[alluser.indexOf(x)]
        } (${
          alluserscore[alluser.indexOf(x)] === undefined
            ? "0"
            : alluserscore[alluser.indexOf(x)]
        }) </div>`;
      }
    });
    infoBoard[0].innerHTML = strv;
  });
  socket.on("init", function(e) {
    socket_local_id = e.idx;
    for (var i = 0; i < 60; i++) {
      for (var j = 0; j < 32; j++) {
        //console.log(e.svd[i][j]);
        if (e.svd[i][j] !== 0) {
          document.getElementById(`${i},${j}`).style.cssText =
            "background: rgba(133, 133, 133, 0.322)";

          if (e.svd[i][j] === -1) {
            document.getElementById(`${i},${j}`).innerHTML = "🚩";
          } else if (e.svd[i][j] === -2) {
            document.getElementById(`${i},${j}`).innerHTML = "💣";
          } else {
            if (e.svd[i][j] == 1) {
              document.getElementById(`${i},${j}`).innerHTML = "";
            } else {
              document.getElementById(`${i},${j}`).innerHTML =
                e.svd[i][j] - 1 + "";
            }
          }
        }
      }
    }
  });

  /* Player Joined */

  socket.on("joined", function(e) {
    title[0].innerHTML = `SOCK_ID: ${
      socket.id
    } / CLID: ${socket_local_id} / ONLINE: ${e.cnt}`;
    currentuser = e.v;
    alluser = e.av;
    alluserscore = e.avs;
    allusername = e.avn;
  });
  socket.on("scoreget", function(e) {
    if (e.includes("+")) addv("Area extension (" + e + ")", 0);
    else if (e.includes("*"))
      addv("Mine Detection Fail (" + e.replace("*", "-") + ")", 1);
    else if (e.includes("/"))
      addv("Build Flag Successfully (" + e.replace("/", "+") + ")", 0);
    else addv("Fail to build flag (" + e + ")");
  });
  /* On SocketBroad */
  socket.on("setflag", function(e) {
    var _ = document.getElementById(e.pos);
    if (e.res !== 0) _.innerHTML = e.res;
    else _.innerHTML = "";
    _.style.cssText = "background: rgba(133, 133, 133, 0.322)";

    // _.id = "";
  });

  /* Players On Hover */
  socket.on("inhover", function(e) {
    while (document.getElementsByClassName("hov").length !== 0) {
      var hovcells = document.getElementsByClassName("hov");
      for (var i = 0; i < hovcells.length; i++) hovcells[i].className = "cell";
    }
    //console.log(e.cursors);
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
    if ((e.target.style.backgroundColor + "").includes("rgba")) return;
    e.target.style.backgroundColor = "#777";
  }

  /* Cells Click Event */
  function cl(e) {
    for (i = 0; i < multiClicked.length; i++) {
      if ((multiClicked[i].style.backgroundColor + "").includes("rgba"))
        continue;
      multiClicked[i].style.backgroundColor = "";
    }

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

    //console.log(e);
  }

  /* Cells RightClick Event */
  function rcl(e) {
    e.preventDefault();
  }
})();
