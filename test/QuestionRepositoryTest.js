const sinon = require('sinon')
const crypto = require("crypto");
const assert = require('assert');
const QuestionRepository = require('../src/QuestionRepository')


describe('should test QuestionRepository', ()=> {
    let cryptoStub;
    const mockQuestionPoll = sinon.mock();
    const mockQuestionPoll2 = sinon.mock();
    const questionId = "20";
    const questionId2 = "30";


    beforeEach(()=>{
        cryptoStub = sinon.stub(crypto, "randomBytes")
    })

    it('should be able to get question using id', ()=>{
        cryptoStub.withArgs(20).returns(Buffer.from(questionId,"hex"))

        let websocketConnection = new QuestionRepository({}, 'someId');
        websocketConnection.addQuestions(mockQuestionPoll)

        assert.equal(websocketConnection.getQuestion(questionId), mockQuestionPoll)
    })

    it('should be able to get multiple number of question using its id', ()=>{
        cryptoStub.withArgs(20).onCall(0).returns(Buffer.from(questionId,"hex"))
        cryptoStub.withArgs(20).onCall(1).returns(Buffer.from(questionId2,"hex"))

        let websocketConnection = new QuestionRepository({}, 'someId');
        websocketConnection.addQuestions(mockQuestionPoll)
        websocketConnection.addQuestions(mockQuestionPoll2)

        assert.equal(websocketConnection.getQuestion(questionId), mockQuestionPoll)
        assert.equal(websocketConnection.getQuestion(questionId2), mockQuestionPoll2)

    })
    
    afterEach(()=>{
        cryptoStub.restore();
    })
})