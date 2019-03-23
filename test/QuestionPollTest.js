let QuestionPoll = require('../src/QuestionPoll')
var assert = require('assert');

describe('should test QuestionPoll', function() {
  const choice1 = 'yes'
  const choice2 = 'no'
  const questionSample = {question: 'Am i real?', choices: [choice1, choice2]}
  let questionPoll;

  beforeEach(()=>{
    questionPoll = new QuestionPoll(questionSample)
  });

  it('should be able to get question', () => {
    assert.equal(questionPoll.getQuestion(), questionSample.question)
  });

  it('should be able to get possible choices', () => {
    assert.deepEqual(questionPoll.getChoicesPoll(), [{choice: choice1, count: 0}, {choice: choice2, count: 0}])
  });

  it('should be able to increment choice count', ()=>{
    questionPoll.addCountToChoice(choice1)

    assert.deepEqual(questionPoll.getChoicesPoll(), [{choice: choice1, count: 1}, {choice: choice2, count: 0}])
  })

  it('should be able to increment choice multiple times', ()=> {
    questionPoll.addCountToChoice(choice1)
    questionPoll.addCountToChoice(choice1)
    questionPoll.addCountToChoice(choice1)
    questionPoll.addCountToChoice(choice2)

    assert.deepEqual(questionPoll.getChoicesPoll(), [{choice: choice1, count: 3}, {choice: choice2, count: 1}])
  })
});