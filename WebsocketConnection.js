const WebSocket = require('ws');
var crypto = require("crypto");
class WebsocketConnection {
    constructor(wss, id){
        this.questions = []
        this.id = id
        this.wss = wss;
        this.setupWssConnection()
        this.questions = new Map();
    }

    addQuestions(question) {
        var id = `${crypto.randomBytes(20).toString('hex')}`;
        this.questions.set(id, question)
        return id
    }

    getConnection(){
        return this.wss;
    }

    setupWssConnection() {
        var i=0;
        var that=this.wss
        this.wss.on('connection', function connection(ws) {
          i++;
          that.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({population: i}));
            }
          });
      
          ws.on('message', function incoming(message) {
            that.clients.forEach(function each(client) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
              }
            });
          });
      
          ws.on('close', function close(){
            i--;
            console.log(`${this.id} connection: ${i}`)
          })
        });
      }
}

module.exports = WebsocketConnection;