//requires
{
  var express = require('express')
  var app = express();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
}
//server setup & config
{
  app.use(express.static("public"));

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });


  http.listen(4000, function () {
    console.log('listening on http://localhost:4000');
  });
}
//global vars
let players = {
  1: {
    id: null,
    name: 'Player 1',
    symbol: 'O',
    isFree: true
  },
  2: {
    id: null,
    name: 'Player 2',
    symbol: 'X',
    isFree: true
  }
};

let board = {};

//chat
var userColors = ["color1", "color2", "color3", "color4", "color5"];
let msgObj = {
  sender: "",
  text: "",
  time: "",
  href: ""
};
var users = {};

//socket.io stuff
{

  io.on('connection', function (socket) {

    //on connection logic
    if (canPlay(socket.id)) {
      addPlayer(socket.id);
      initBoard();
    } else {
      socket.emit('cannotPlay', 'Sorry, there is no space for a player! Please try again later!');
    }
    io.emit('newPlayer', players);
    io.emit('getBoardStatus', board);

    socket.on('login name', function (name) {

      var time = new Date(new Date().getTime()).toLocaleTimeString();
      var colorIndex = Math.floor(Math.random() * userColors.length);
      users[socket.id] = {
          name: name.toUpperCase(),
          // name: usernamesByIP[socket.handshake.address].toUpperCase(),
          color: userColors[colorIndex],
          ip: socket.handshake.address
      };

      msgObj = {
          sender: "Server",
          text: "You have connected to the server.",
          time: time,
          color: "serverColor",
          href: null
      };

      socket.emit('chat message', msgObj);
      console.log(socket.handshake.address);

    });

    //on disconnect logic
    socket.on('disconnect', function () {
      removePlayer(socket.id);

      //chat
      var time = new Date(new Date().getTime()).toLocaleTimeString();
        var msg = users[socket.id].name + " disconnected";

        msgObj = {
            sender: "Server",
            text: msg,
            time: time,
            color: "serverColor",
            href: null
        };

        console.log(msg);
        io.emit('chat message', msgObj);
        delete users[socket.id];
    });


    //custom events management
    socket.on("clicked", function (cell) {
      let player = null;
      player = getPlayerFromID(socket.id);
      if (player != null) {
        updateBoard(cell, player);
        io.emit('getBoardStatus', board);
      }
    });
    socket.on('resetBoard', function () {
      initBoard();
      io.emit('getBoardStatus', board);
    })

    //chat msging
    socket.on('chat message', function (msg) {
      var time = new Date(new Date().getTime()).toLocaleTimeString();
      var href = null;
      if (isLink(msg)) {
          href = createHref(msg);
      }
      msgObj = {
          sender: users[socket.id].name,
          text: capitalizeFirstLetter(msg),
          time: time,
          color: users[socket.id].color,
          href: href
      };

      console.log(msgObj);
      io.emit('chat message', msgObj);
  });

  });
}

const addPlayer = (id) => {
  if (players[1].isFree) {
    players[1].id = id;
    players[1].isFree = false;
    console.log("player 1 free")
  } else if (players[2].isFree) {
    players[2].id = id;
    players[2].isFree = false;
    console.log("player 2 free")
  }
  console.log(players);
  return;
}

const canPlay = () => {
  return players[1].isFree || players[2].isFree;
}

const removePlayer = (id) => {
  for (let i = 1; i <= 2; i++) {
    if (players[i].id == id) {
      players[i].id = null;
      players[i].isFree = true;
    }
  }
  console.log(players);
}

const getPlayerFromID = (id) => {
  // for(var player in Object.keys(players)){
  //   if (players.hasOwnProperty(player)) {
  //     if (players[player].id == id) {
  //       return players[player];
  //     }
  //   }
  // }
  // console.log(players);
  // return;
  if (players[1].id == id) {
    return players[1];
  } else if (players[2].id == id) {
    return players[2];
  }
}

const initBoard = () => {
  board = {
    1: {
      1: "",
      2: "",
      3: ""
    },
    2: {
      1: "",
      2: "",
      3: ""
    },
    3: {
      1: "",
      2: "",
      3: ""
    }
  }
};

const updateBoard = (cell, player) => {
  board[cell.column][cell.row] = player.symbol;
}


//chat
isLink = function (txt) {
  var re = /http.*|www[.][a-zA-Z0-9]*[.][a-zA-Z]{2,5}/;
  return re.test(txt);
};

createHref = function (url) {
  if (/http:\/\//.test(url)) {
      return url;
  } else if (/https:\/\//.test(url)) {
      return url;
  } else {
      return "http://" + url;
  }
};

capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}