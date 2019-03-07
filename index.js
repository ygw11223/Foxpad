const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SocketIOFile = require('socket.io-file');
const port =  3000;
const hashes = require('short-id');

// Maintain infomation on active sessions. Currently only conatins number of
// users per seesion.
// TODO(Guowei) : Come up with a better format.
CANVAS_IDS = {}

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
    var canvas_id = req.originalUrl.substr(8);
    // Check if session id is valid.
    if (!(canvas_id in CANVAS_IDS)) {
        res.status(400).send('Invalid Url!');
    } else {
        res.sendFile(__dirname + '/client/build/index.html');
    }
});
// Otherwise redirect to a new canvas page.
app.get('/', function (req, res) {
    // Create a new session id.
    var id = hashes.generate();
    CANVAS_IDS[id] = 0;
    DATABASE[id] = {};

    res.redirect('/canvas/' + id);
    console.log("New session created:", id);
});


function onConnection(socket){
    socket.on('init', (auth_info) => {
        // Initialize socket.
        // TODO : Save infomation on socket object can potentially crash
        // server. Need to investigate a better solution.
        socket.canvas_id = auth_info.canvas_id;
        socket.join(socket.canvas_id);
        // Number of client in this session incremented.
        CANVAS_IDS[auth_info.canvas_id] += 1;
        DATABASE[socket.canvas_id][socket.id] = [];

        console.log("One user joined", socket.canvas_id);
    });

    // Save drawing data and broadcast to all of its peers
    socket.on('drawing', (data) => {
        // TODO(Guowei) : Update when connecting firebase to server.
        var idx_last = DATABASE[socket.canvas_id][socket.id].length - 1;
        DATABASE[socket.canvas_id][socket.id][idx_last].push(data);
        socket.broadcast.in(socket.canvas_id).emit('drawing', data);
    });

    socket.on('command', (cmd) => {
        switch (cmd) {
            // Draw all previous strokes to the client
            case 'update':
                // TODO : Currently not considering order of strokes. Same for undo.
                data_array = [];
                for (var user in DATABASE[socket.canvas_id]) {
                    for (var stroke = 0; stroke < DATABASE[socket.canvas_id][user].length; stroke++) {
                        for (var seg = 0; seg < DATABASE[socket.canvas_id][user][stroke].length; seg++) {
                            data_array.push(DATABASE[socket.canvas_id][user][stroke][seg]);
                        }
                    }
                }
                socket.emit('redraw', data_array);
                break;
            case 'undo':
                DATABASE[socket.canvas_id][socket.id].pop();
                data_array = [];
                for (var user in DATABASE[socket.canvas_id]) {
                    for (var stroke = 0; stroke < DATABASE[socket.canvas_id][user].length; stroke++) {
                        for (var seg = 0; seg < DATABASE[socket.canvas_id][user][stroke].length; seg++) {
                            data_array.push(DATABASE[socket.canvas_id][user][stroke][seg]);
                        }
                    }
                }
                socket.emit('redraw', data_array);
                socket.broadcast.in(socket.canvas_id).emit('redraw', data_array);
                break;
            case 'new_stroke':
                DATABASE[socket.canvas_id][socket.id].push([]);
                break;
            default:
                console.log("Invalid command received.")
        }

    });

    socket.on('disconnect', () => {
        CANVAS_IDS[socket.canvas_id] -= 1;
        console.log("One user left", socket.canvas_id);
    });

    var uploader = new SocketIOFile(socket, {
        // uploadDir: {         // multiple directories
        //  music: 'data/music',
        //  document: 'data/document'
        // },
        uploadDir: 'images',
        // TODO(Guowei) : Add accept format and adjust parameters later.
        // accepts: [],
        // maxFileSize: 4194304,
        // transmissionDelay: 0,
    });
    uploader.on('start', (fileInfo) => {
        console.log('Start uploading');
        console.log(fileInfo);
    });
    uploader.on('stream', (fileInfo) => {
        console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
    });
    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.');
        console.log(fileInfo);
    });
    uploader.on('error', (err) => {
        console.log('Error!', err);
    });
    uploader.on('abort', (fileInfo) => {
        console.log('Aborted: ', fileInfo);
    });
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
