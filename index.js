const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port =  3000;
const hashes = require('short-id');

// Maintain infomation on active sessions. Currently only conatins number of
// users per seesion.
// TODO(Guowei) : Come up with a better format.
SESSION_IDS = {}

// Maintain stroke info per session.
// TODO(Guowei) : Update when connecting firebase to server.
// TODO(Guowei) : Maybe need a r/w lock.
DATABASE = {}

// Routing. TODO(Guowei) : Refine Routing logic.
// Request for static file should start with "/static". Ex. "/static/main.css"
// All static files should be in "/public" on server.
app.use('/static', express.static(__dirname + '/client/build'))
// Request for opening an canvas should be "/canvas/VALID_ID".
app.get('/canvas/*', function (req, res) {
    // Get session id.
    var session_id = req.originalUrl.substr(8);
    // Check if session id is valid.
    if (!(session_id in SESSION_IDS)) {
        res.status(400).send('Invalid Url!');
    } else {
        res.sendFile(__dirname + '/client/build/index.html');
    }
});
// Otherwise redirect to a new canvas page.
app.get('/', function (req, res) {
    // Create a new session id.
    var id = hashes.generate();
    SESSION_IDS[id] = 0;
    DATABASE[id] = [];

    res.redirect('/canvas/' + id);
    console.log("New session created:", id);
});


function onConnection(socket){
    socket.on('init', (auth_info) => {
        // Initialize socket.
        socket.session_id = auth_info.session_id;
        socket.join(socket.session_id);
        // Number of client in this session incremented.
        SESSION_IDS[auth_info.session_id] += 1;

        console.log("One user joined", socket.session_id);
    });

    // Save drawing data and broadcast to all of its peers
    socket.on('drawing', (data) => {
        // TODO(Guowei) : Update when connecting firebase to server.
        DATABASE[socket.session_id].push(data);
        socket.broadcast.in(socket.session_id).emit('drawing', data);
    });

    socket.on('command', (cmd) => {
        switch (cmd) {
            // Draw all previous strokes to the client
            case 'update':
                for (var i = 0; i < DATABASE[socket.session_id].length; i++) {
                    socket.emit('drawing', DATABASE[socket.session_id][i]);
                }
                console.log("Client strokes updated.");
                break;
            default:
                console.log("Invalid command received.")
        }

    });

    socket.on('disconnect', () => {
        SESSION_IDS[socket.session_id] -= 1;
        console.log("One user left", socket.session_id);
    });


}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
