import http from "http";
import WebSocket from "ws";
import express from "express";
import { parse } from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

//console.log("hello");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
//app.listen(3000, handleListen);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
/*function handleConnection(socket) {
    console.log(socket);
}*/

//wss.on("connection", handleConnection);

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "낯선사람";
    //console.log(socket);
    console.log("♥ Connected to Browser ♥");   
    socket.on("close", () => console.log("☆ Disconnected from Brower ☆"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`)); 
            case "nickname":
                socket["nickname"] = message.payload;
                
                //console.log(message.payload);    
        }
        //console.log(parsed, message.toString('utf8'));
        // if(parsed.type === "new_message"){
        //     sockets.forEach((aSocket) => aSocket.send(parsed.payload))
        // } else if(parsed.type === "nickname"){
        //     console.log(parsed.payload);
        // }
        //sockets.forEach(aSocket => aSocket.send(message.toString('utf8')));
        //console.log(message.toString('utf8'));
        //socket.send(message.toString('utf8'));
    });
    //socket.send("hello!");
});

server.listen(3000, handleListen);