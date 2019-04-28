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

// Request for joining an canvas room should be "/room/VALID_ID".
app.get('/room/*', function (req, res) {
    // Get room id.
    var room_id = req.originalUrl.substr(8);
    // Check if room id is valid.
    if (!(room_id in USER_INFO)) {
        res.status(400).send('Invalid Url!');
    } else {
        res.sendFile(__dirname + '/client/build/index.html');
    }
});
app.get('/new_room', function (req, res) {
    // Create a new canvas id.
    var id = hashes.generate();
    SESSION_INFO[id] = {};
    SESSION_INFO[id]['.num_canvas'] = 0;
    USER_INFO[id] = {};

    res.status(200);
    res.type("text/json");
    res.send(id);
    console.log("New room created:", id);
});
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/client/build/index.html');
});

function onConnection(socket){
    socket.on('init', (auth_info) => {
        // Leave previous canvas
        if (socket.canvas_id) {
            socket.leave(socket.canvas_id);
        }

        var new_canvas = false;
        const rid = auth_info.room_id;
        const cid = auth_info.canvas_id;
        const uid = auth_info.user_id;
        // Initialize socket.
        socket.room_id = rid;
        socket.canvas_id = cid;
        socket.user_id = uid;

        // Check if room id is valid.
        if (!(rid in USER_INFO)) {
            SESSION_INFO[rid] = {};
            SESSION_INFO[rid]['.num_canvas'] = 0;
            USER_INFO[rid] = {};
            console.log("New room id encountered when init socket.");
        }
        if (!(uid in USER_INFO[rid])) {
            USER_INFO[rid][uid] = randomColor({luminosity: 'dark'});
        }
        if (!(uid in SESSION_INFO[rid])) {
            console.log(uid, "joined", cid);
        }
        SESSION_INFO[rid][uid] = {
            color: USER_INFO[rid][uid],
            pos_x_mouse: 0,
            pos_y_mouse: 0,
            timestamp: 0,
            pen_color: 0,
            pen_width: 0,
            canvas_id: cid,
        }
        // Create canvas in database
        if (!(cid in DATABASE)) {
            DATABASE[cid] = {};
            SESSION_INFO[rid]['.num_canvas'] += 1;
            console.log('new canvas');
            new_canvas = true;
        }
        // Initilize user information
        if (!(uid in DATABASE[cid])) {
            DATABASE[cid][uid] = [];
        }
        socket.join([cid, rid]);
        if (new_canvas) {
            socket.broadcast.in(rid).emit('canvas_update',SESSION_INFO[rid]['.num_canvas']);
        }

        var members = {};
        for (var key in SESSION_INFO[rid]) {
            members[key] = SESSION_INFO[rid][key]['color'];
        }
        socket.broadcast.in(rid).emit('session_update', members);
        socket.emit('session_update', members);
        socket.emit('canvas_update',SESSION_INFO[rid]['.num_canvas']);
    });

    // Save drawing data and broadcast to all of its peers
    socket.on('drawing', (data) => {
        // TODO(Guowei) : Update when connecting firebase to server.
        var idx_last = DATABASE[socket.canvas_id][socket.user_id].length - 1;
        DATABASE[socket.canvas_id][socket.user_id][idx_last].push(data);
        socket.broadcast.in(socket.canvas_id).emit('drawing', data);
    });

    socket.on('mouse_position', (data) => {
        const cid = socket.canvas_id;
        const uid = socket.user_id;
        const rid = socket.room_id;

        SESSION_INFO[rid][uid]['pos_x_mouse'] = data.x;
        SESSION_INFO[rid][uid]['pos_y_mouse'] = data.y;
        SESSION_INFO[rid][uid]['pen_width'] = data.w;
        SESSION_INFO[rid][uid]['timestamp'] = new Date().getTime();

        var mouse_data = {};
        for (var key in SESSION_INFO[rid]) {
            if (cid == SESSION_INFO[rid][key]['canvas_id']) {
                mouse_data[key] = SESSION_INFO[rid][key];
            }
        }
        socket.broadcast.in(cid).emit('mouse_position', mouse_data);
        if (Math.random() < 0.05) {
            socket.emit('mouse_position', mouse_data);
        }
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
                if (1280 >= width && 720 >= height) {
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
        } else {
            socket.emit('image', 'NONE');
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
        const rid = socket.room_id;
        const cid = socket.canvas_id;
        const uid = socket.user_id;

        if (socket.room_id) {
            delete SESSION_INFO[rid][uid];
            var members = {};
            for (var key in SESSION_INFO[rid]) {
                members[key] = SESSION_INFO[rid][key]['color'];
            }
            socket.broadcast.in(rid).emit('session_update', members);
            console.log(uid, "left", rid);
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
