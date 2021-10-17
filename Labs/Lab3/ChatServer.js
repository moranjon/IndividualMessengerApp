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

    socketclient.on("register", async (username,password)=> {
        //useful TODO: print out debug information
        const registation_result = await
        DataLayer.addUser(username,password);
        socketclient.emit("registration",registation_result)
    })
    socketclient.on("login", async (username, password) => {
        console.log("Debug>Got username="+username + ";password="+password);
        var checklogin = await DataLayer.checklogin(username,password)
        if(checklogin){
            // Other Code
            socketclient.authenticated=true;
            socketclient.emit("authenticated");
            socketclient.username=username;
            var welcomemessage = username + " has joined the chat system!";
            console.log(welcomemessage);
            SendToAuthenticatedClient(socketclient,"welcome", welcomemessage);
        }
        else{
            console.log("Invalid Login Emitted");
            socketclient.emit("invalidLogin");
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

var messengerdb=require("./messengerdb")
var DataLayer = {
    info: 'Data Layer Implementation for Messenger',
    async addUser(username,password){
        const result = await
        messengerdb.addUser(username,password);
        return result;
    },
    async checklogin(username,password){
        var checklogin_result = await messengerdb.checklogin(username,password)
        console.log("Debug>DataLayer.checklogin->result=" + checklogin_result)
        return checklogin_result
    
        
        //for testing only
        //if ((username=="Jon" && password=="123") || (username=="Bob" && password=="321")){
        //    return true;
        //} else if (username=="" || password=="") {
        //    var invalidLoginMessage = "User did not enter anything for username or password. Try again.";  
        //    console.log(invalidLoginMessage);
        //    socketio.sockets.emit("Invalid login", invalidLoginMessage);          
        //    return false;
        //} else {
        //console.log("checklogin: " + username + "/" + password);
        //console.log("Just for testing - return true"); 
        //    invalidLoginMessage = "Invalid login. Try Again"; 
        //    console.log(invalidLoginMessage);
        //    socketio.sockets.emit("Invalid login", invalidLoginMessage);          
        //    return false;
        //}
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

function hideRegistrationScreen(){
var registrationScreen = document.getElementById("registrationScreen");
registrationScreen.style.display = "none";//"block" is to display
}
function showRegistrationScreen(){
var registrationScreen = document.getElementById("registrationScreen");
registrationScreen.style.display = "block";//"none" is to hide
}