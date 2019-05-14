const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const SocketIOFile = require('socket.io-file');
const port = 3000;
const hashes = require('short-id');
const cv = require('opencv4nodejs');
const { exec } = require('child_process');
const fs = require('fs');
const Set = require("collections/set");
const randomColor = require('randomcolor');

// Max level of multi-resolution image pyramid.
const MaxImageLevel = 5;

// Maintain infomation on users.
USER_INFO = {};

// Maintain infomation on active session
SESSION_INFO = {};

// Maintain stroke info per session.
// TODO(Guowei) : Update when connecting firebase to server.
// TODO(Guowei) : Maybe need a r/w lock.
DATABASE = {};

IMAGES = {};

STALE_CANVAS = {};

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

setInterval(() => {
    let sockets = io.sockets.clients()['connected'];
    let updated = new Set();


    for (let id in sockets) {
        let cid = sockets[id].canvas_id;
        if (cid === undefined) continue;
        // Here and below: update preview of stale canvas in the next 2 period
        // to compensate for data race problems.
        if (!(cid in STALE_CANVAS)) STALE_CANVAS[cid] = 2;

        if (STALE_CANVAS[cid] > 0 && !updated.has(cid)) {
            STALE_CANVAS[cid] -= 1;
            updated.add(cid);
            sockets[id].emit('update', 'canvas_preview');
        }
  }
}, 5000);

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
            SESSION_INFO[rid][uid] = {
                color: USER_INFO[rid][uid],
                pos_x_mouse: 0,
                pos_y_mouse: 0,
                pos_x_viewport: 0,
                pos_y_viewport: 0,
                width_viewport: 0,
                height_viewport: 0,
                timestamp: 0,
                pen_color: 0,
                pen_width: 0,
                canvas_id: cid,
            }
        } else {
            SESSION_INFO[rid][uid]['canvas_id'] = cid;
        }
        // Create canvas in database
        if (!(cid in DATABASE)) {
            DATABASE[cid] = {};
            SESSION_INFO[rid]['.num_canvas'] += 1;
            console.log('New canvas created.');
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
        socket.emit('canvas_update',SESSION_INFO[rid]);
        STALE_CANVAS[cid] = 2;
    });

    // Save drawing data and broadcast to all of its peers
    socket.on('drawing', (data) => {
        const cid = socket.canvas_id;
        const uid = socket.user_id;

        if (cid === undefined || uid === undefined) {
            return;
        }

        // TODO(Guowei) : Update when connecting firebase to server.
        var idx_last = DATABASE[cid][uid].length - 1;
        DATABASE[cid][uid][idx_last].push(data);
        socket.broadcast.in(cid).emit('drawing', data);
        // Mark canvas as stale
        if (!STALE_CANVAS[cid]) {
            STALE_CANVAS[cid] = 2;
        }
    });

    socket.on('position', (uid) => {
        const rid = socket.room_id;

        if (rid === undefined || SESSION_INFO[rid][uid] === undefined) {
            return;
        }

        let pos = {
            x: SESSION_INFO[rid][uid]['pos_x_viewport'],
            y: SESSION_INFO[rid][uid]['pos_y_viewport'],
            w: SESSION_INFO[rid][uid]['width_viewport'],
            h: SESSION_INFO[rid][uid]['height_viewport'],
            cid: SESSION_INFO[rid][uid]['canvas_id'].substr(-1),
            uid: uid,
        }
        socket.emit('position', pos);
    });

    socket.on('preivew', (data) => {
        const cid = socket.canvas_id;
        const rid = socket.room_id;

        if (rid === undefined || cid === undefined) {
            return;
        }

        socket.broadcast.in(rid).emit('preview', data);
        let base64Data = data.url.replace(/^data:image\/png;base64,/, "");
        fs.writeFile('images/preview' + rid + data.id + '.png', base64Data, 'base64', function(err) {
            if (err) console.log(err);
        });
    });

    socket.on('mouse_position', (data) => {
        const cid = socket.canvas_id;
        const uid = socket.user_id;
        const rid = socket.room_id;

        if (cid === undefined || uid === undefined || rid === undefined ||
            SESSION_INFO[rid][uid] === undefined) {
            return;
        }

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

    socket.on('viewport_position', (data) => {
        const cid = socket.canvas_id;
        const uid = socket.user_id;
        const rid = socket.room_id;

        if (cid === undefined || uid === undefined || rid === undefined ||
            SESSION_INFO[rid][uid] === undefined) {
            return;
        }

        SESSION_INFO[rid][uid]['pos_x_viewport'] = data.x;
        SESSION_INFO[rid][uid]['pos_y_viewport'] = data.y;
        SESSION_INFO[rid][uid]['width_viewport'] = data.w;
        SESSION_INFO[rid][uid]['height_viewport'] = data.h;

        socket.broadcast.in(rid).emit('viewport_position', SESSION_INFO[rid]);
    });

    socket.on('image', (pos) => {
        const cid = socket.canvas_id;

        if (cid === undefined) {
            return;
        }

        // We assume each canvas only have one background image.
        if (cid in IMAGES) {
            let level = pos.l;
            let data = {
                w: IMAGES[cid].w,
                h: IMAGES[cid].h,
                url: IMAGES[cid].name + level + '.png',
                cid: cid,
            };
            // Determine image width and height, fitting into a area of 864x1568
            if (data.w/data.h > 1568/864) {
                data.h = Math.floor(1568*data.h/data.w);
                data.w = 1568;
            } else {
                data.w = Math.floor(864*data.w/data.h);
                data.h = 864;
            }

            // Update client only if the corresponding level exists in the image pyramid
            if (level >= 0 && level <= MaxImageLevel) {
                socket.emit('image', data);
            }
        } else {
            socket.emit('image', 'NONE');
        }
    });

    socket.on('command', (cmd) => {
        const cid = socket.canvas_id;
        const uid = socket.user_id;

        if (cid === undefined || uid === undefined) {
            return;
        }

        switch (cmd) {
            // Draw all previous strokes to the client
            case 'update':
                // TODO : Currently not considering order of strokes. Same for undo.
                data_array = [];
                for (var user in DATABASE[cid]) {
                    for (var stroke = 0; stroke < DATABASE[cid][user].length; stroke++) {
                        for (var seg = 0; seg < DATABASE[cid][user][stroke].length; seg++) {
                            data_array.push(DATABASE[cid][user][stroke][seg]);
                        }
                    }
                }
                socket.emit('redraw', data_array);
                break;
            case 'undo':
                DATABASE[cid][uid].pop();
                data_array = [];
                for (var user in DATABASE[cid]) {
                    for (var stroke = 0; stroke < DATABASE[cid][user].length; stroke++) {
                        for (var seg = 0; seg < DATABASE[cid][user][stroke].length; seg++) {
                            data_array.push(DATABASE[cid][user][stroke][seg]);
                        }
                    }
                }
                socket.emit('redraw', data_array);
                socket.broadcast.in(cid).emit('redraw', data_array);
                // Mark canvas as stale
                if (!STALE_CANVAS[cid]) {
                    STALE_CANVAS[cid] = true;
                }
                break;
            case 'new_stroke':
                DATABASE[cid][uid].push([]);
                break;
            default:
                console.log("Invalid command received.")
        }
    });

    socket.on('disconnect', () => {
        const rid = socket.room_id;
        const cid = socket.canvas_id;
        const uid = socket.user_id;

        if (cid === undefined || uid === undefined || rid === undefined || SESSION_INFO[rid][uid] === undefined) {
            return
        }

        delete SESSION_INFO[rid][uid];
        let members = {};
        for (let key in SESSION_INFO[rid]) {
            members[key] = SESSION_INFO[rid][key]['color'];
        }
        socket.broadcast.in(rid).emit('session_update', members);
        socket.broadcast.in(rid).emit('viewport_position', SESSION_INFO[rid]);
        console.log(uid, "left", rid);
    });

    var uploader = new SocketIOFile(socket, {
        uploadDir: 'images',
        rename: function(filename, fileInfo) {
            // Make sure of unique file name.
            return socket.canvas_id + filename;},
        // TODO(Guowei) : Add accept format and adjust parameters later.
        // accepts: [],
        maxFileSize: 50000000,
        overwrite: true,
    });

    uploader.on('start', (fileInfo) => {
        console.log('Start uploading');
        console.log(fileInfo);
    });

    uploader.on('stream', (fileInfo) => {
        //console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
    });

    function buildImages(filePath, socket) {
        let cid = socket.canvas_id;
        // Build image pyramid for multiple resolutions
        cv.imreadAsync(filePath, (err, mat) => {
            if (mat && mat.cols && mat.rows && cid && !IMAGES[socket.canvas_id]) {
                IMAGES[socket.canvas_id] = {
                    'w': mat.cols,
                    'h': mat.rows,
                    'name': filePath,
                };
                console.log(IMAGES[socket.canvas_id]);
                // Hardcoded building up 6 levels from lowest to highest resolution.
                // TODO : Decide levels based on image size.
                cv.imwrite(filePath + '0.png', mat.pyrDown().pyrDown().pyrDown().pyrDown().pyrDown());
                cv.imwrite(filePath + '1.png', mat.pyrDown().pyrDown().pyrDown().pyrDown());
                cv.imwrite(filePath + '2.png', mat.pyrDown().pyrDown().pyrDown());
                cv.imwrite(filePath + '3.png', mat.pyrDown().pyrDown());
                cv.imwrite(filePath + '4.png', mat.pyrDown());
                cv.imwrite(filePath + '5.png', mat);
                socket.emit('update', 'image_ready');
                socket.broadcast.in(socket.canvas_id).emit('update', 'image_ready');
                console.log('Image uploaded.');
            } else {
                socket.emit('update', 'image_ready');
            }
            STALE_CANVAS[cid] = 2;
        });
    }

    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.');
        const cid = socket.canvas_id;

        if (fileInfo.uploadDir.substr(-4) === '.pdf') {
            let file_Exe = 'montage -mode Concatenate -tile 1x -density 150 -quality 100 '
                + fileInfo.uploadDir + ' ./images/' + cid + '.png';
            exec(file_Exe, function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('Error when converting pdf: ' + error);
                } else {
                    console.log('Pdf converted: ' + stdout);
                    buildImages('./images/'+cid+'.png', socket);
                }
            });
        } else {
            buildImages(fileInfo.uploadDir, socket)
        }
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
