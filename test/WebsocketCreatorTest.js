const sinon = require('sinon')
let WebsocketCreator = require('../src/WebsocketCreator')
const WebSocket = require('ws');
var assert = require('assert');

describe('should test Websocket Creator', ()=>{
    let wss = {}
    beforeEach(()=>{
        wss = {
            openConnectionCallback: null,
            closeConnectionCallback: null,
            sendMessageCallback: null,
            ws : {on: function(state, callback){
        
                if(state === 'message'){
                    sendMessageCallback = callback;
                }
                else if(state === 'close'){      
                    closeConnectionCallback = callback;
                }
            }},
            on: function(state, callback){
                if(state === 'connection'){
                    openConnectionCallback = callback;
                }
               
            }, 
            clients: [],
            openConnection: function(client){
                wss.clients.push(client)
                openConnectionCallback(wss.ws)
            },
            sendMessage: function(message){
                sendMessageCallback(message)
            },
            closeConnection: function(){
                closeConnectionCallback()
            }
        }
    })
    it('when no open connection should have empty populatioon', ()=> {
        let websocketCreator = new WebsocketCreator(wss);
        assert.equal(websocketCreator.getPopulation(), 0)
    });

    it('when opening connection should send message to client and increase population', () => {
        let client = generateClient(WebSocket.OPEN)

        let websocketCreator = new WebsocketCreator(wss);
        wss.openConnection(client);

        assert(client.send.calledWith(JSON.stringify({population: 1})))
        assert.equal(websocketCreator.getPopulation(), 1)
    });

    it('when opening multiple connection should send message to clients and increase population', () => {
        let client = generateClient(WebSocket.OPEN)
        let client2 = generateClient(WebSocket.OPEN)
        let websocketCreator = new WebsocketCreator(wss);

        wss.openConnection(client);
        assert(client.send.calledWith(JSON.stringify({population: 1})))

        wss.openConnection(client2);
        assert(client.send.calledWith(JSON.stringify({population: 2})))
        assert(client2.send.calledWith(JSON.stringify({population: 2})))

        assert.equal(websocketCreator.getPopulation(), 2)
    })

    it('when opening connection and client websocket is not open state should not send message', () => {
        let client = generateClient(WebSocket.CLOSED)

        let websocketCreator = new WebsocketCreator(wss);
        wss.openConnection(client);

        assert(client.send.notCalled)
    })

    it('when new message is receive should send it to registered clients', ()=> {
        let client = generateClient(WebSocket.OPEN)

        let websocketCreator = new WebsocketCreator(wss);
        wss.openConnection(client);
        wss.sendMessage("send message")

        assert(client.send.calledWith("send message"))
    })

    it('when new message is receive and state is not open should not send it to client', ()=> {
        let client = generateClient(WebSocket.CLOSED)

        let websocketCreator = new WebsocketCreator(wss);
        wss.openConnection(client);
        wss.sendMessage("send message")

        assert(client.send.notCalled)
    })

    it('when closing connection should update the population', () => {
        let client = generateClient(WebSocket.CLOSED)

        let websocketCreator = new WebsocketCreator(wss);

        wss.openConnection(client);
        assert.equal(websocketCreator.getPopulation(), 1)
        wss.closeConnection()
        assert.equal(websocketCreator.getPopulation(), 0)
    })

    function generateClient(websocketstate) {
        return {
            readyState: websocketstate, 
            send: sinon.spy()
        }
    };

})