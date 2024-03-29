require("dotenv").config();
const admin = require("firebase-admin");
var serviceAccount = require("./privatekey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://rizzume-1d369-default-rtdb.asia-southeast1.firebasedatabase.app",
});
const pdf = require("pdf-parse");
const TelegramBot = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAIKEY,
});
const openai = new OpenAIApi(configuration);

// const askQuestion = async (chatId, question) => {
//   await bot.sendMessage(chatId, question);
//   return new Promise((fullfill) => {
//     answerCallbacks[chatId] = (msg) => {
//       if (msg.hasOwnProperty("document") || msg.text[0] !== "/") {
//         fullfill(msg);
//       }
//     };
//   });
// };
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEBOTKEY;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
//bot.on("document", async (msg) => {
const callAPIdoc = async (input, resume, msg) => {
  // bot.getFile(msg.document.file_id).then((file) => {
  //   bot.downloadFile(file.file_id, "./files").then((response) => {
  //     // read the pdf file here
  //     pdf(response).then(async function (data) {
  //       const chatRef = admin.database().ref("chats/" + msg.chat.id);
  //       chatRef.set({ pdf: data.text });
  console.log(msg);
  const chatRef = admin.database().ref("chats/" + msg.chat.id);
  var resText = null;
  await chatRef.once(
    "value",
    (snapshot) => {
      resText = snapshot.val()?.pdf;
    },
    (errorObject) => {
      console.log("not found");
    }
  );
  console.log(resText);
  if (!resText) {
    bot.sendMessage(msg.chat.id, "No resume found, try uploading it?");
    return;
  }
  var prompt = input.concat(resume ? resText : "");
  console.log(prompt);
  // delete the file from your server if it's necessary
  if (input) {
    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 3000,
        temperature: 0.6,
      });
      console.log(completion.data.choices[0].text);
      bot.sendMessage(msg.chat.id, completion.data.choices[0].text);
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }
  }
};
//DECLARE CALL BACK STORAGE
const answerCallbacks = {};
const askQuestion = async (chatId, question) => {
  await bot.sendMessage(chatId, question);
  return new Promise((fullfill) => {
    answerCallbacks[chatId] = (msg) => {
      if (msg.hasOwnProperty("document") || msg.text[0] !== "/") {
        fullfill(msg);
      }
    };
  });
};
const StorePdfInDB = async (msg) => {
  if (!msg.hasOwnProperty("document")) {
    console.log("this is not a file");
    return false;
  }
  bot.getFile(msg.document.file_id).then((file) => {
    bot.downloadFile(file.file_id, "./files").then((response) => {
      // read the pdf file here
      pdf(response).then(async function (data) {
        var prompt_check = data.text.concat("Is this a resume yes or no?");
        if (prompt_check) {
          const check = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt_check,
            max_tokens: 3000,
            temperature: 0.6,
          });
          if (check.data.choices[0].text.includes("Yes")) {
            storeRes(msg.chat.id, data.text);
            bot.sendMessage(msg.chat.id, "Upload sucessful!", {
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
            });
            return true;
          } else {
            console.log(data.text);
            bot.sendMessage(msg.chat.id, "Please upload a valid resume");
            return false;
          }
        } else {
        }
      });
    });
  });
};
var getRes = async (chatId) => {
  const chatRef = admin.database().ref("chats/" + chatId);
  const val = await chatRef.once(
    "value",
    (snapshot) => {
      var resume = snapshot.val()?.pdf;
      return resume;
    },
    (errorObject) => {
      console.log("not found");
      return null;
    }
  );
  return val.val();
};
const storeRes = async (chatId, storetext) => {
  const chatRef = admin.database().ref("chats/" + chatId);
  await chatRef.set({ pdf: storetext });
};
module.exports = {
  bot,
  callAPIdoc,
  answerCallbacks,
  askQuestion,
  admin,
  StorePdfInDB,
  getRes,
  storeRes,
};
