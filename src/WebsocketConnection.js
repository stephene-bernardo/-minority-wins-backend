const WebSocket = require('ws');
let crypto = require("crypto");
let QuestionPoll = require('./QuestionPoll')
let WebsocketCreator = require('./WebsocketCreator')

class WebsocketConnection {
    constructor(wss, id){
        this.id = id
        this.wss = wss;
        this.websocketCreator = new WebsocketCreator(this.wss)
        this.questions = new Map();
    }

    addQuestions(question) {
        var id = `${crypto.randomBytes(20).toString('hex')}`;
        let questionPoll = new QuestionPoll(question)
        this.questions.set(id, questionPoll)
        return id
    }

    getQuestion(id){
      return this.questions.get(id);
    }

    getConnection(){
        return this.wss;
    }
}

module.exports = WebsocketConnection;