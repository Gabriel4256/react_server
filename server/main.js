import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import orientDB from 'orientjs';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import api from './routes';
import fs from 'fs';
import http from 'http';
import socket_io from 'socket.io';

const app = express();
const port = 3000;
const devPort = 4000;

const dbServer = orientDB({
    host: 'localhost',
    port: 2424,
    username: 'root',
    password: 'ssh2159'
});

const db = dbServer.use('usersinfo');
const server = http.Server(app);
const io = socket_io.listen(server);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/api', api);
app.use('/', express.static(path.join(__dirname, './../public')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './../public/index.html'));
});
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



server.listen(port, () => {
    console.log('Express is listening on port', port);
});
if (process.env.NODE_ENV == 'development') {
    console.log('Server is running on development mode');
    const config = require('../webpack.dev.config');
    const compiler = webpack(config);
    const devServer = new WebpackDevServer(compiler, config.devServer);
    devServer.listen(
        devPort, () => {

            console.log('webpack-dev-server is listening on port', devPort);
        }
    );
}

///////////////////////////////
///socket.io 설정 부분/////////
var usersinfo = {};     //TODO: Store these two varibles into db
var socketsinfo = {};
var rooms = {};         // 
io.sockets.on('connection', (socket) => {
    console.log("socket is connected");
    var currentUser = "";
    socket.on('user:join', (data) => {
        console.log(data.userId + " has joined to " + data.room);
        makeRoom(data.room);
        joinRoom(socket, data);
        logger();
    });

    socket.on('user:left', (data) => {
        leftRoom(socket, data);
        logger();
    });

    socket.on('send:message', (data) => {
        console.log("message has arrived" + JSON.stringify(data));
        socket.broadcast.to(data.room).emit("send:message", data.msg);

    });

    socket.on('disconnect', function () {
        var userId = socketsinfo[socket.id].userId;
        var room = socketsinfo[socket.id].room;
        if (socketsinfo[socket.id] && containsUser(room, userId) == 1) {
            socket.broadcast.to(room).emit("left:room", { userId})
        }
        leftRoom(socket, userId);
        delete socketsinfo[socket.id];
        console.log("user: " + userId +   "disconnected from room: " + room);
        logger();
    });
});

function logger(){
    console.log(JSON.stringify(rooms));
    console.log(JSON.stringify(usersinfo));
}

function makeRoom(roomName) { //TODO: Change the way of storing the information => db
    if (!rooms[roomName]) {
        rooms[roomName] = [];
    }
}

function leftRoom(socket, data) {
    if (data.userId!=="") {
        console.log(data.userId + " has left from " + data.room);
        if (containsUser(data.room, data.userId) == 1) {
            socket.broadcast.to(data.room).emit('user:left', { userId: data.userId });
        }
    }
    rooms[data.room].splice(rooms[data.room].indexOf(socket.id), 1);
    socket.leave(data.room);
    socketsinfo[socket.id].room = "";

}

function joinRoom(socket, data) {

    if(data.userId!==""){
        console.log(data.userId + "is going to join the room " + data.room);
        console.log("#1: " + socket.id)
    }
    socket.join(data.room);
    socketsinfo[socket.id] = { room: data.room, userId: data.userId };
    rooms[data.room].push(socket.id);
    socket.emit('init', { users: getPureUserList(data.room), room: data.room });
    if (data.userId != "") {
        if (containsUser(data.room, data.userId) == 0) {
            socket.broadcast.to(data.room).emit('user:join', { userId: data.userId });
        }
    }

}

function containsUser(roomName, userId) {
    if (roomName != "") {
        var tmp = rooms[roomName].filter((socketId, index) => {
            console.log(JSON.stringify(socketsinfo));
            return socketsinfo[socketId].userId == userId
        })
        return tmp.length;
    }
    return -1;
}

function getPureUserList(roomName) {
    if(rooms[roomName].length==0){
        return [];
    }
    return getUniqueObjectArray(getUsersFromSocketIdArray(getSocketsIn(roomName)));
}

function getSocketsIn(roomName) {
    console.log(roomName + " : " + JSON.stringify(rooms[roomName]));
    return rooms[roomName];
}

function getUsersFromSocketIdArray(SocketIdArray) {
    return SocketIdArray.map((socketId, index, array) => {
        return socketsinfo[socketId].userId;
    })
}

function getUniqueObjectArray(array) {
    return array.filter((item, i) => {
        return array.findIndex((item2, j) => {
            return item === item2;
        }) === i && item != "";
    });
}

/////////////////////////////
/////////////////////////////