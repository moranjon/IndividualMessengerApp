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
    socketclient.on("login", (username, password) => {
        console.log("Debug>Got username="+username + ";password="+password);
        if(DataLayer.checklogin(username,password)){
            socketclient.authenticated=true;
            socketclient.emit("authenticated");
            socketclient.username=username;
            var welcomemessage = username + " has joined the chat system!";
            console.log(welcomemessage);
            //socketio.sockets.emit("welcome", welcomemessage);
            SendToAuthenticatedClient(socketclient,"welcome",welcomemessage)
        }
        //socketclient.username = username;
        //var welcomemessage = username + " has joined the chat system!";
        //console.log(welcomemessage);
        //socketio.sockets.emit("welcome", welcomemessage);
    });
    socketclient.on("chat", (message) => {
        if(!socketclient.authenticated){
            console.log("Unauthenticated client sent a chat. Supress!");
            return;
        }        
        var chatmessage = socketclient.username + " says: " + message;
        console.log(chatmessage);
        //socketio.sockets.emit("chat", chatmessage);
        SendToAuthenticatedClient(undefined,"chat",chatmessage);
    });
});
var DataLayer = {
    info: 'Data Layer Implementation for Messenger',
    checklogin(username,password){
        //for testing only
        console.log("checklogin: " + username + "/" + password);
        console.log("Just for testing - return true");
        return true;
    }
}

function SendToAuthenticatedClient(sendersocket,type,data){
    var sockets = socketio.sockets.sockets;
    for(var socketId in sockets) {
        var socketclient = sockets[socketId];
        if(socketclient.authenticated){
            socketclient.emit(type,data);
            var logmsg= "Debug:>sent to" +
                socketclient.username + "with ID=" + socketId;
            console.log(logmsg);
        }
    }
}