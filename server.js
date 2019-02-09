const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 4000;

app.use(express.static(__dirname + '/client/public'));

function onConnection(socket){
  socket.on('drawing', (data) => {
      console.log(data);
      socket.broadcast.emit('drawing', data)
    });
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
