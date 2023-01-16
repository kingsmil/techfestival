const {
  bot,
  callAPIdoc,
  askQuestion,
  answerCallbacks,
} = require("./supporting.js");
/// THIS IS THE START MSG!
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome", {
    reply_markup: {
      keyboard: [["Improve Resume"], ["Fit Resume into Job"], ["Cover Letter"],["Job Reccomendation"]],
    },
  });
});
//TODO change above commands to / as the callback wont detect the changes
//TODO more features?
//TODO test result with false resume value(middle argument) for callAPIDoc
//THIS IS WHERE YOU CHANGE/ADD MESSAGES
bot.on("message", async function (msg) {
  const text = msg.text;
  const chatId = msg.chat.id;
  if (text === "Improve Resume") {
    //askQuestion will send the 2nd argument as a text to the user
    // and will return the user's reply
    var ans = await askQuestion(chatId, "Upload your resume!");
    //every callAPIdoc will assume that it is being fed a document
    //args are callAPIdoc(text before resume, add resume(set to false if not including data), msg)
    await callAPIdoc(
      "As an industry expert,please give specific and personalised points for improvements in my resume by quoting examples in my resume :",
      true,
      ans
    );
  }
  if (text === "Fit Resume into Job") {
    var jobd = await askQuestion(chatId, "Enter Job Description/Title");
    var ans = await askQuestion(chatId, "Upload your resume!");
    await callAPIdoc(
      'for this job description:"'.concat(
        jobd.text,
        '",ChatGPT, as an industry expert, provide me personalised and specific points in order for me to match my resume to this job:'
      ),
      true,
      ans
    );
  }
  if (text === "Cover Letter") {
    var jobd = await askQuestion(chatId, "Enter Job Description");
    var ans = await askQuestion(chatId, "Upload your resume!");
    await callAPIdoc(
      'for this job description and company:"'.concat(
        jobd.text,
        '",draft me a cover letter using my resume:'
      ),
      true,
      ans
    );
  }
  if(text=="Job Reccomendation"){
    var ans = await askQuestion(chatId, "Upload your resume!");
    await callAPIdoc(
      'What job roles in tech roles should i be looking for as an internship using my resume: ',
      true,
      ans
    );
  }
  const callback = answerCallbacks[msg.chat.id];
  if (callback) {
    delete answerCallbacks[msg.chat.id];
    return callback(msg);
  }
});
