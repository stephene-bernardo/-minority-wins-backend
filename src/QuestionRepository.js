let crypto = require("crypto");

class QuestionRepository {
    constructor(wss, id){
        this.id = id
        this.wss = wss;
        this.questions = new Map();
    }

    addQuestions(questionPoll) {
        var id = `${crypto.randomBytes(20).toString('hex')}`;
        this.questions.set(id, questionPoll)
        return id
    }

    getQuestion(id){
      return this.questions.get(id);
    }
}

module.exports = QuestionRepository;