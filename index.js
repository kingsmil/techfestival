const {
  bot,
  callAPIdoc,
  askQuestion,
  answerCallbacks,
  admin,
} = require("./supporting.js");
/// THIS IS THE START MSG!
bot.onText(/\/start/, (msg) => {
  var chatIdData = admin.database().get("chats/" + msg.chat.id);
  if(chatIdData){
    bot.sendMessage(
      msg.chat.id,
      "Welcome back to Rizz-ume! Would you like to update your resume? :)",
      {
        reply_markup: {
          keyboard: [
            ["Yes!"],
            ["It is fine the way it is!"]
          ],
        },
      }
    );
  }
  else{
    var resume = askQuestion(chatId, "Welcome to Rizz-ume! Please upload your resume!");
    while(!StorePdfInDB(resume)){
      
    }
  }
});
//TODO change above commands to / as the callback wont detect the changes
//TODO more features?
//TODO test result with false resume value(middle argument) for callAPIDoc
//THIS IS WHERE YOU CHANGE/ADD MESSAGES
bot.on("document", async function (msg) {
  
}
)

bot.on("message", async function (msg) {
  const text = msg.text;
  const chatId = msg.chat.id;
  var ans = "";
  if(text=="Yes!"){
    ans = await askQuestion(chatId, "Upload your resume!");
  }
  if(text=="It is fine the way it is!"){
    const chatRef = admin.database().ref("chats/" + msg.chat.id);
    ans = conschatRef.set({ pdf: data.text });
  }
  if (text === "I want to improve my resume!") {
    //askQuestion will send the 2nd argument as a text to the user
    // and will return the user's reply
    //every callAPIdoc will assume that it is being fed a document
    //args are callAPIdoc(text before resume, add resume(set to false if not including data), msg)
    await callAPIdoc(
      "As an industry expert,please give specific and personalised points for improvements in my resume by quoting examples in my resume :",
      true,
      ans
    );
  }
  if (text === "I want my resume to fit for a certain job!") {
    var jobd = await askQuestion(chatId, "Enter Job Description/Title");
    await callAPIdoc(
      'for this job description:"'.concat(
        jobd.text,
        '",ChatGPT, as an industry expert, provide me personalised and specific points in order for me to match my resume to this job:'
      ),
      true,
      ans
    );
  }
  if (text === "I need help with cover letter!") {
    var jobd = await askQuestion(chatId, "Enter Job Description");
    await callAPIdoc(
      'for this job description and company:"'.concat(
        jobd.text,
        '",draft me a cover letter using my resume:'
      ),
      true,
      ans
    );
  }
  if (text == "Job Reccomendation") {
    await callAPIdoc(
      "What job roles in tech roles should i be looking for as an internship using my resume: ",
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
