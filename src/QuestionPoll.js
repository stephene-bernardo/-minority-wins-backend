class QuestionPoll {
    constructor(question){
        this.choicesPopularity = new Map();
        this.question = question.question
        let that = this;
        question['choices'].map(value => {
            that.choicesPopularity.set(value, 0)
        })

        console.log(this.choicesPopularity.keys());
    }

    getQuestion(){
        return this.question
    }

    getChoicesPoll() {
        let arr = []
        for(let entry of this.choicesPopularity.entries()){
            arr.push({choice: entry[0], count: entry[1]})
        }
        return arr;
    }

    addCountToChoice(choice){
        this.choicesPopularity.set(choice, this.choicesPopularity.get(choice)+1)
    }
}

module.exports = QuestionPoll;