var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'),
    fs = require('fs');

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


io.sockets.on('connection', function (socket, pseudo) {

    var today = new Date();
    var myToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
         fs.appendFile('log.txt',myToday +' : ' + socket.pseudo + ' joined \r\n', function (err) {
          if (err) {
            console.log("Error append file");
          }
          });
    });
    
    socket.on('create',function(data){
        pseudo = ent.encode(data.pseudo);
        room = ent.encode(data.channel);
        socket.join(room);
        socket.pseudo = pseudo;
        socket.channel= room;
        io.in(data.channel).emit('nouveau_channel', {pseudo:data.pseudo,channel:data.channel});
        fs.appendFile('log.txt',myToday + ' : ' + socket.pseudo + ' joined ' + socket.channel + '\r\n', function (err) {
          if (err) {
            console.log("Error append file");
          }
          });
    })
    
    socket.on('leave_channel',function(data){
        socket.leave(data.channel);
        io.in(data.channel).emit('leave_channel_notif', {pseudo:data.pseudo,channel:data.channel});
        fs.appendFile('log.txt',myToday +  ' : ' + socket.pseudo + ' leaved ' + socket.channel + '\r\n', function (err) {
          if (err) {
            console.log("Error append file");
          }
          });
    })
    
    socket.on('message', function (data) {
        message = ent.encode(data.message);
        if(socket.adapter.sids[socket.id][data.channel] != undefined){
            io.in(data.channel).emit('message', {pseudo: socket.pseudo, message: data.message,channel:data.channel});
        fs.appendFile('log.txt',myToday + ' : ' + socket.pseudo + ' in ' + socket.channel + ' said :  '+message +'\r\n', function (err) {
          if (err) {
            console.log("Error append file");
          }});
        }
        
    }); 
});

server.listen(8080);