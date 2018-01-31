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
app.get('*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, './../public/index.html'));
});
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});



server.listen(port, () => {
    console.log('Express is listening on port', port);
});
if(process.env.NODE_ENV == 'development') {
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
var rooms = {};         // 
io.sockets.on('connection', (socket) =>{
    console.log("socket is connected");
    var currentUser = "";
    socket.on('user:join', (data)=>{
        console.log(data + " has joined");
        makeRoom(data.room);
        if(usersinfo[data.userId]){
            leftRoom(socket, data);
        }
        joinRoom(socket, data);
    });

    socket.on('user:left', (data)=>{
        leftRoom(socket, data);
    });

    socket.on('send:message', (data)=>{
        console.log("message has arrived" + JSON.stringify(data));
        socket.broadcast.to(data.room).emit("send:message", data.msg);
    });

    socket.on('disconnect', function(){
        console.log("user disconnected");
    });
});

function makeRoom(room){ //TODO: Change the way of storing the information => db
    if(!rooms[room]){
        rooms[room] = [];
    }    
}

function leftRoom(socket, data){
    if(data.userId!==""){
        //let prevroom = usersinfo[data.userId];
        console.log(data.userId + " has left from " + data.prevroom);
        if(rooms[data.prevroom]){
            rooms[data.prevroom].splice(rooms[data.prevroom].indexOf(data.userId), 1);
        }
        usersinfo[data.userId]='';
        socket.broadcast.to(data.prevroom).emit('user:left', {userId: data.userId});
    }
    socket.leave(data.prevroom);
}

function joinRoom(socket, data){
    console.log(data.userId + "is going to join the room " + data.room);
    socket.join(data.room);
    socket.emit('init', {users: rooms[data.room], room: data.room});
    if(data.userId!=""){
        socket.broadcast.to(data.room).emit('user:join', {userId: data.userId});
        rooms[data.room].push(data.userId);
        usersinfo[data.userId] = data.room;
    }
}

/////////////////////////////
/////////////////////////////
