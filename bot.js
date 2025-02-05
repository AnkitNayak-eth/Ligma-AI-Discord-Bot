require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const API_URL = process.env.API_URL;

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "/help") {
    const helpMessage = `This bot responds with savage Gen Z roasts and answers to your queries. It is powered by Llama 3.3 70B. Created by ankit.eth (Discord username). You can reach out to me here: [ankit.eth](https://discord.com/users/492673876472627200)`;
    return message.reply(helpMessage);
  }

  if (!message.content.toLowerCase().includes("ligma")) return;

  const messageWithoutLigma = message.content
    .toLowerCase()
    .replace("ligma", "")
    .trim();

  const senderName = message.author.username;

  const prompt = `${messageWithoutLigma} (Respond with savage Gen Z roast in maximum 5 lines, maximum sarcasm, and maximum roast energy. Be harsh, offensive, and meme-style. After roasting, answer.)`;

  try {
    const response = await axios.get(
      API_URL + encodeURIComponent(prompt)
    );
    const botReply =
      response.data.message || "Your internet must be on a coffee break. It’s taking forever to load. ☕";
    message.reply(`${senderName}, ${botReply}`);
  } catch (error) {
    console.error("Error fetching from Llama API:", error);
    message.reply(
      "Ligma servers are down. Guess you got no friends to blame. 💀"
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
