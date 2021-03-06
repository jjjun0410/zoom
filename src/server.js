import http from "http";
//import WebSocket from "ws";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";
import express from "express";
//import { parse } from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

//console.log("hello");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
//app.listen(3000, handleListen);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});

instrument(wsServer, {
    auth: false
});

function publicRooms(){
    const {sockets: {
        adapter: {sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    })
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "낯선사람";
    socket.onAny((event) => {
        console.log(`Socket Event:${event}`);
    });

    //console.log(socket);
    //socket.on("enter_room", (roomName, done) => {

    socket.on("enter_room", (roomName, nickname, done) => {
        socket["nickname"] = nickname;
        socket.join(roomName);
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
        done();

        //console.log(roomName);
        //console.log(socket.id);
        //console.log(socket.rooms);
        //console.log(socket.rooms);
        // setTimeout(() => {
        //     done("hello from the backend");
        // }, 15000);
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room =>
             socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });

    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

//const wss = new WebSocket.Server({ server });
/*function handleConnection(socket) {
    console.log(socket);
}*/

//wss.on("connection", handleConnection);

// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "낯선사람";
//     //console.log(socket);
//     console.log("♥ Connected to Browser ♥");   
//     socket.on("close", () => console.log("☆ Disconnected from Brower ☆"));
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`)); 
//             case "nickname":
//                 socket["nickname"] = message.payload;
                
//                 //console.log(message.payload);    
//         }
//         //console.log(parsed, message.toString('utf8'));
//         // if(parsed.type === "new_message"){
//         //     sockets.forEach((aSocket) => aSocket.send(parsed.payload))
//         // } else if(parsed.type === "nickname"){
//         //     console.log(parsed.payload);
//         // }
//         //sockets.forEach(aSocket => aSocket.send(message.toString('utf8')));
//         //console.log(message.toString('utf8'));
//         //socket.send(message.toString('utf8'));
//     });
//     //socket.send("hello!");
// });

httpServer.listen(3000, handleListen);