const WebSocket = require('ws');

class WebsocketCreator {
    constructor(wss) {
        this.wss = wss;
        this.population = 0;
        this.wss.on('connection', (ws) => this.onConnection(ws));
      }

      onConnection(ws){
        this.population++;
        console.log(this.population)
        this.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({population: this.population}));
          }
        });
    
        ws.on('message', (message) => this.onMessage(message));
    
        ws.on('close', () => this.onClose())
      }

      onMessage(message) {
        this.wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }

      onClose () {
        this.population--;
        console.log(`${this.id} connection: ${this.population}`)
      }

      getPopulation() {
        return this.population;
      }
    }


module.exports = WebsocketCreator