const {
  bot,
  callAPIdoc,
  askQuestion,
  answerCallbacks,
  admin,
  storeRes,
  getRes,
  StorePdfInDB,
} = require("./supporting.js");
/// THIS IS THE START MSG!

bot.on("polling_error", console.log);
bot.onText(/\/start/, async (msg) => {
  var chatIdData = await getRes(msg.chat.id);
  console.log(chatIdData);
  if (chatIdData != null) {
    bot.sendMessage(
      msg.chat.id,
      "Welcome back to Rizz-ume! Would you like to update your resume? :)",
      {
        reply_markup: {
          keyboard: [
            ["Yes, update my resume!"],
            ["I want to improve my resume!"],
            ["I want my resume to fit for a certain job!"],
            ["I need help with cover letter!"],
            ["Job recommendation"],
            ["Help me with something else!"],
          ],
        },
      }
    );
  } else {
    var resume = await askQuestion(
      msg.chat.id,
      "Welcome to Rizz-ume! Please upload your resume!"
    );
    if (!StorePdfInDB(resume)) {
      bot.sendMessage(msg.chat.id, "Please try again.");
    }
  }
});

bot.on("message", async function (msg) {
  const text = msg.text;
  const chatId = msg.chat.id;
  var ans = msg;
  if (text == "Yes, update my resume!") {
    ans = await askQuestion(chatId, "Upload your resume!");
    while (!StorePdfInDB(ans)) {
      bot.sendMessage(msg.chat.id, "Please send in a proper resume.");
    }
  }
  if (text == "It is fine the way it is!") {
    //put your new keyboard here
    ans = getRes(chatId);
  }
  if (text === "I want to improve my resume!") {
    //askQuestion will send the 2nd argument as a text to the user
    // and will return the user's reply
    //every callAPIdoc will assume that it is being fed a document
    //args are callAPIdoc(text before resume, add resume(set to false if not including data), msg)
    await callAPIdoc(
      "As an industry expert,please give specific and personalised points for improvements in my resume and avoid generic advice unless necessary by quoting examples in my resume following: ",
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
  if (text == "Job recommendation") {
    await callAPIdoc(
      "What job roles in tech roles should i be looking for as an internship using my resume: ",
      true,
      ans
    );
  }
  if (text == "Help me with something else!") {
    const custom = await askQuestion(chatId, "What do you need help with?");
    const resumein = await askQuestion(
      chatId,
      "Type 'Add resume' to add resume to your question at the end."
    );

    await callAPIdoc(custom.text, resumein == "Add resume" ? true : false, ans);
  }
  const callback = answerCallbacks[msg.chat.id];
  if (callback) {
    delete answerCallbacks[msg.chat.id];
    return callback(msg);
  }
});
