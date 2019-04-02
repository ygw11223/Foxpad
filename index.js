const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SocketIOFile = require('socket.io-file');
const port =  3000;
const hashes = require('short-id');
<<<<<<< eaa87cced5a7b8f5089e0b36400906d818161976
<<<<<<< 07a6d86a013f53bf70ae26f117762c6ceb522df5
const cv = require('opencv4nodejs');
const MaxImageLevel = 3;
=======
const fs = require('fs');
>>>>>>> add image broadcasting on server
=======
const cv = require('opencv4nodejs');
>>>>>>> add image pyr with 3 levels

// Maintain infomation on active sessions. Currently only conatins number of
// users per seesion.
// TODO(Guowei) : Come up with a better format.
CANVAS_IDS = {};

// Maintain stroke info per session.
// TODO(Guowei) : Update when connecting firebase to server.
// TODO(Guowei) : Maybe need a r/w lock.
DATABASE = {};

IMAGES = {};

IMAGES = {}

// Routing. TODO(Guowei) : Refine Routing logic.
// Request for static file should start with "/static". Ex. "/static/main.css"
// All static files should be in "/public" on server.
app.use('/static', express.static(__dirname + '/client/build'));
app.use('/canvas/images', express.static(__dirname + '/images'));
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
        socket.canvas_id = auth_info.canvas_id;
        socket.user_id = auth_info.user_id
        // Check if canvas id is valid.
        if (!(socket.canvas_id in DATABASE)) {
            DATABASE[socket.canvas_id] = {};
            console.log("New canvas_id encountered when init socket.");
        }
        socket.join(socket.canvas_id);
        // Number of client in this session incremented.
        CANVAS_IDS[auth_info.canvas_id] += 1;
        if (!(socket.user_id in DATABASE[socket.canvas_id])) {
            DATABASE[socket.canvas_id][socket.user_id] = [];
        }
        console.log("One user joined", socket.canvas_id);
    });

    // Save drawing data and broadcast to all of its peers
    socket.on('drawing', (data) => {
        // TODO(Guowei) : Update when connecting firebase to server.
        var idx_last = DATABASE[socket.canvas_id][socket.user_id].length - 1;
        DATABASE[socket.canvas_id][socket.user_id][idx_last].push(data);
        socket.broadcast.in(socket.canvas_id).emit('drawing', data);
    });

    socket.on('image', (pos) => {
<<<<<<< eaa87cced5a7b8f5089e0b36400906d818161976
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
=======
        if (socket.session in IMAGES) {
            var level = 2;
            while (level > 0) {
                var nRows = IMAGES[socket.canvas_id][level].rows;
                var nCols = IMAGES[socket.canvas_id][level].cols;
                if (pos.w >= nCols && pos.h >= nRows) {
                    break;
                }
                level -= 1;
            }
            level += pos.l;
            if (level > 3) l = 3;
            if (level < 1) l = 1;

            if (pos.x + pos.w > IMAGES[socket.canvas_id][level].cols) {
                pos.w = IMAGES[socket.canvas_id][level].cols - pos.x;
            }
            if (pos.y + pos.h > IMAGES[socket.canvas_id][level].rows) {
                pos.h = IMAGES[socket.canvas_id][level].rows - pos.y;
            }
            if (pos.w > 0 && pos.h > 0) {
                const region = IMAGES[socket.canvas_id][i].getRegion(new cv.Rect(pos.x, pos.y, pos.w, pos.h));
                socket.emit('image', cv.imencode('.jpg', region).toString('base64'));
            } else {
                socket.emit('image', 'NA');
>>>>>>> add image pyr with 3 levels
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
        CANVAS_IDS[socket.canvas_id] -= 1;
        console.log("One user left", socket.canvas_id);
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
