
const http = require('http');
const WebSocket = require('ws');
var crypto = require("crypto");
let WebsocketConnection = require('./WebsocketConnection')
let registeredPathnames = new Map();

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

  if (req.url === '/createroom') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    var id = `${crypto.randomBytes(20).toString('hex')}`;
    const wss = new WebSocket.Server({ noServer: true });
    let websocketConnection = new WebsocketConnection(wss,id)
    registeredPathnames.set(id, websocketConnection);
    res.write(`{"roomid":"${id}"}`);
  } else if (RegExp('^\/sendquestions\/\w*').test(req.url) && req.method == 'POST') {
    var id = /(\/sendquestions)(\/\w*)/.exec(req.url)[2].replace('/', '')
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      registeredPathnames.get(id).getConnection().clients.forEach((function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          registeredPathnames.get(id).addQuestions(body)
          body.id = registeredPathnames.get(id).addQuestions(body)
          console.log(body)
          client.send(body);
        }
      }))
    });
    res.write(`{}`);
  } else if(RegExp('^\/sendanswer\/.+\/.+').test(req.url)){
    console.log(/^\/sendanswer\/(.+)\/(.+)/.exec(req.url))
    res.write('has url');
  } else {
    res.write('no url');
  }
  res.end();
});

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = (request.url).replace('/', '');
  if (registeredPathnames.has(pathname)) {
    handleUpgrade(pathname, request, socket, head);
  } else {
    socket.destroy();
  }
});

server.listen(8080);

function handleUpgrade(pathname, request, socket, head) {
  registeredPathnames.get(pathname).getConnection().
    handleUpgrade(request, socket, head, function done(ws) {
      registeredPathnames.get(pathname).getConnection().emit('connection', ws, request);
    });
}
