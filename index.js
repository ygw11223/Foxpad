const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SocketIOFile = require('socket.io-file');
const port =  3000;
const hashes = require('short-id');
const cv = require('opencv4nodejs');
var randomColor = require('randomcolor');
// Max level of multi-resolution image pyramid.
const MaxImageLevel = 3;

// Maintain infomation on users.
USER_INFO = {};

// Maintain infomation on active session
SESSION_INFO = {};

// Maintain stroke info per session.
// TODO(Guowei) : Update when connecting firebase to server.
// TODO(Guowei) : Maybe need a r/w lock.
DATABASE = {};

IMAGES = {};

// Routing. TODO(Guowei) : Refine Routing logic.
// Request for static file should start with "/static". Ex. "/static/main.css"
// All static files should be in "/public" on server.
app.use('/static', express.static(__dirname + '/client/build'));
app.use('/canvas/images', express.static(__dirname + '/images'));

// Request for joining an canvas should be "/canvas/VALID_ID".
app.get('/canvas/*', function (req, res) {
    // Get canvas id.
    var canvas_id = req.originalUrl.substr(8);
    // Check if session id is valid.
    if (!(canvas_id in SESSION_INFO)) {
        res.status(400).send('Invalid Url!');
    } else {
        res.sendFile(__dirname + '/client/build/index.html');
    }
});
app.get('/new_canvas', function (req, res) {
    // Create a new canvas id.
    var id = hashes.generate();
    SESSION_INFO[id] = {};
    USER_INFO[id] = {}
    DATABASE[id] = {};

    res.status(200);
    res.type("text/json");
    res.send(id);
    console.log("New canvas created:", id);
});
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/client/build/index.html');
});

function onConnection(socket){
    socket.on('init', (auth_info) => {
        // Initialize socket.
        socket.canvas_id = auth_info.canvas_id;
        socket.user_id = auth_info.user_id
        // Check if canvas id is valid.
        if (!(socket.canvas_id in DATABASE)) {
            DATABASE[socket.canvas_id] = {};
            SESSION_INFO[socket.canvas_id] = {};
            USER_INFO[socket.canvas_id] = {};
            console.log("New canvas_id encountered when init socket.");
        }
        socket.join(socket.canvas_id);
        if (!(socket.user_id in DATABASE[socket.canvas_id])) {
            DATABASE[socket.canvas_id][socket.user_id] = [];
        }

        // Initilize user information
        if (!(socket.user_id in USER_INFO[socket.canvas_id])) {
            USER_INFO[socket.canvas_id][socket.user_id] = randomColor({luminosity: 'dark'});
        }
        SESSION_INFO[socket.canvas_id][socket.user_id] = USER_INFO[socket.canvas_id][socket.user_id];
        socket.broadcast.in(socket.canvas_id).emit('session_update', SESSION_INFO[socket.canvas_id]);
        socket.emit('session_update', SESSION_INFO[socket.canvas_id]);
        console.log(socket.user_id, "joined", socket.canvas_id);
    });

    // Save drawing data and broadcast to all of its peers
    socket.on('drawing', (data) => {
        // TODO(Guowei) : Update when connecting firebase to server.
        var idx_last = DATABASE[socket.canvas_id][socket.user_id].length - 1;
        DATABASE[socket.canvas_id][socket.user_id][idx_last].push(data);
        socket.broadcast.in(socket.canvas_id).emit('drawing', data);
    });

    socket.on('image', (pos) => {
        // We assume each canvas only have one background image.
        if (socket.canvas_id in IMAGES) {
            // Find the proper default resolution level of the image,
            // which is the image of biggest size that can fit into the canvas.
            var level = MaxImageLevel;
            var width = IMAGES[socket.canvas_id].w;
            var height = IMAGES[socket.canvas_id].h;
            while (level > 0) {
                if (pos.w >= width && pos.h >= height) {
                    break;
                }
                level -= 1;
                width /= 2;
                height /= 2;
            }
            // Substract the relative zooming level of the canvas.
            level -= pos.l;

            // Update client only if the corresponding level exists in the image pyramid
            if (level >= 0 && level <= MaxImageLevel) {
                socket.emit('image', IMAGES[socket.canvas_id].name + level + '.png');
                console.log('Image sent.');
            }
        }
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
                DATABASE[socket.canvas_id][socket.user_id].pop();
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
                DATABASE[socket.canvas_id][socket.user_id].push([]);
                break;
            default:
                console.log("Invalid command received.")
        }
    });

    socket.on('disconnect', () => {
        if (socket.canvas_id) {
            delete SESSION_INFO[socket.canvas_id][socket.user_id];
            socket.broadcast.in(socket.canvas_id).emit('session_update', SESSION_INFO[socket.canvas_id]);
            console.log(socket.user_id, "left", socket.canvas_id);
        }
    });

    var uploader = new SocketIOFile(socket, {
        uploadDir: 'images',
        rename: function(filename, fileInfo) {
            // Make sure of unique file name.
            return socket.canvas_id + filename;},
        // TODO(Guowei) : Add accept format and adjust parameters later.
        // accepts: [],
        maxFileSize: 50000000,
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
        // Build image pyramid for multiple resolutions
        cv.imreadAsync(fileInfo.uploadDir, (err, mat) => {
            IMAGES[socket.canvas_id] = {
                'w': mat.cols,
                'h': mat.rows,
                'name': fileInfo.uploadDir
            };
            console.log(IMAGES[socket.canvas_id]);
            // Hardcoded building up 4 levels from lowest to highest resolution.
            // TODO : Decide levels based on image size.
            cv.imwrite(fileInfo.uploadDir + '0.png', mat.pyrDown().pyrDown().pyrDown());
            cv.imwrite(fileInfo.uploadDir + '1.png', mat.pyrDown().pyrDown());
            cv.imwrite(fileInfo.uploadDir + '2.png', mat.pyrDown());
            cv.imwrite(fileInfo.uploadDir + '3.png', mat);

            socket.emit('update', 'image_ready');
            socket.broadcast.in(socket.canvas_id).emit('update', 'image_ready');
            console.log('Image uploaded.');
        })
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
