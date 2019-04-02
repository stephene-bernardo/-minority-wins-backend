
const http = require('http');
const WebSocket = require('ws');
var crypto = require("crypto");
let QuestionRepository = require('./src/QuestionRepository')
let registeredPathnames = new Map();
let WebsocketCreator = require('./src/WebsocketCreator')
const QuestionPoll = require('./src/QuestionPoll')


const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

  if (req.url === '/createroom') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    var id = `${crypto.randomBytes(20).toString('hex')}`;
    const wss = new WebSocket.Server({ noServer: true });

    let websocketCreator = new WebsocketCreator(wss);
    let websocketConnection = new QuestionRepository(wss,id)
    registeredPathnames.set(id, {questions: websocketConnection, websocketconnection: websocketCreator});
    res.write(`{"roomid":"${id}"}`);
  } else if (RegExp('^\/sendquestions\/\w*').test(req.url) && req.method == 'POST') {
    var id = /(\/sendquestions)(\/\w*)/.exec(req.url)[2].replace('/', '')
    var body = '';
    await req.on('data', function (data) {
      body += data;
      console.log(body)
    });
    let questionId;
    console.log("is this end logging????")
    await req.on('end', function () {
      jsonBody = JSON.parse(body);
      questionId = registeredPathnames.get(id).questions.addQuestions(new QuestionPoll(jsonBody))
      jsonBody['uid'] = questionId;
      console.log("is question "+ questionId)
      registeredPathnames.get(id).websocketconnection.getWebsocket().clients.forEach((function each(client) {
        console.log("websocket client")
        if (client.readyState === WebSocket.OPEN) {
          console.log("websocket open")
          client.send(JSON.stringify(jsonBody));
        }
      }))

      console.log(`before timeout ${questionId}`)
      setTimeout(()=> {
        console.log(`after timeout ${questionId}`)
        registeredPathnames.get(id).websocketconnection.getWebsocket().clients.forEach((function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            let questionObject = registeredPathnames.get(id).questions.getQuestion(questionId);
            let choicesPoll = questionObject.getChoicesPoll()
            client.send(JSON.stringify({
              isEndWaiting: true, 
              choicesPoll: choicesPoll, 
              questionId: questionId, 
              question: questionObject.getQuestion()}));
          }
        }))
      }, 30000)
    }); 
   
    res.write(`{}`);
  } else if(RegExp('^\/sendanswer\/.+\/.+').test(req.url)){
    let pathParam = /^\/sendanswer\/(.+)\/(.+)\/(.+)/.exec(req.url)
    let websocketId = pathParam[1]
    let questionPollId =  pathParam[2]
    let answer = pathParam[3]

    let questionPoll = registeredPathnames.get(websocketId).questions.getQuestion(questionPollId)
    questionPoll.addCountToChoice(answer)
    console.log(questionPoll.getChoicesPoll())
    res.write('{}');
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

server.listen(process.env.PORT || 8080);

function handleUpgrade(pathname, request, socket, head) {
  registeredPathnames.get(pathname).websocketconnection.getWebsocket().
    handleUpgrade(request, socket, head, function done(ws) {
      registeredPathnames.get(pathname).websocketconnection.getWebsocket().emit('connection', ws, request);
    });
}
