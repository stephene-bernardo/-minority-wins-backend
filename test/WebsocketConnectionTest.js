const sinon = require('sinon')

let WebsocketConnection = require('../src/WebsocketConnection')
describe('should test WebsocketConnection', ()=> {
    it('init', ()=>{
        var wss = {on: function(){}}
        var mock = sinon.mock(wss)
        mock.expects("on").once();
        let websocketConnection = new WebsocketConnection(wss, 'someId');
        mock.verify();
    })
})