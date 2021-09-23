var http = require('http')
var app = require('express')()
var server = http.createServer(app)
const port = process.env.PORT || 8080
server.listen(port);
console.log(`Express HTTP Server is listening at port ${port}`)
app.get('/', (request, response) => {
  console.log("Got an HTTP request")  
  response.sendFile(__dirname+'/index.html')
})
var io = require('socket.io');
var socketio = io.listen(server);
console.log("Socket.IO is listening at port: " + port);
socketio.on("connection", function (socketclient) {
    console.log("A new Socket.IO client is connected. ID= " + socketclient.id);
    socketclient.on("login", (username) => {
        socketclient.username = username;
        var welcomemessage = username + " has joined the chat system!";
        console.log(welcomemessage);
        socketio.sockets.emit("welcome", welcomemessage);
    });
    socketclient.on("chat", (message) => {
        var chatmessage = socketclient.username + " says: " + message;
        console.log(chatmessage);
        socketio.sockets.emit("chat", chatmessage);
    });
});
