const http = require('http');
const WebSocket = require('ws');
var crypto = require("crypto");
let registeredPathnames = new Map();

const server = http.createServer((req, res) => {
  if(req.url === '/createroom'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var id = `/${crypto.randomBytes(20).toString('hex')}`;
    const wss = new WebSocket.Server({ noServer: true });
    setupWssConnection(wss);
    registeredPathnames.set(id, wss);
    res.write('room created ' + id);
    res.end();
  } else if(RegExp('^\/sendquestions\/\w*').test(req.url) && req.method == 'POST'){
    var id = /(\/sendquestions)(\/\w*)/.exec(req.url)[2]
 

    var body = '';
    req.on('data', function (data) {
        body += data;
        console.log("Partial body: " + body);
    });
    req.on('end', function () {
        console.log( registeredPathnames.get(id));
        registeredPathnames.get(id).clients.forEach((function each(client) {
          if ( client.readyState === WebSocket.OPEN) {
            client.send("hillo");
          }
        }))
    });
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end();
  }else{
    res.write('no url');
    res.end();
  }
});

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = (request.url);
  if (registeredPathnames.has(pathname)) {
    handleUpgrade(pathname, request, socket, head);
  } else {
    socket.destroy();
  }
});

server.listen(8080);

function handleUpgrade(pathname, request, socket, head) {
  registeredPathnames.get(pathname).
    handleUpgrade(request, socket, head, function done(ws) {
      registeredPathnames.get(pathname).emit('connection', ws, request);
    });
}

function setupWssConnection(wss) {
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  });
}
