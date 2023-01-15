require("dotenv").config();
const pdf = require("pdf-parse");
const TelegramBot = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAIKEY,
});

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEBOTKEY;
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// // Matches "/echo [whatever]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message

//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"

//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, "Received your message");
  bot.sendMessage(chatId, "test 1");
  console.log(msg);
});

bot.on("document", async (msg) => {
  bot.getFile(msg.document.file_id).then((file) => {
    bot.downloadFile(file.file_id, "./files").then((response) => {
      // read the pdf file here
      pdf(response).then(async function (data) {
        var prompt =
          "As an industry expert,please give specific and personalised points for improvements in my resume by quoting examples in my resume" +
          data.text;
        console.log(prompt);
        //delete the message
        //bot.deleteMessage(msg.chat.id, msg.message_id);
        // delete the file from your server if it's necessary
        if (data) {
          const openai = new OpenAIApi(configuration);
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
      });
    });
  });
});
