const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const API_URL = process.env.API_URL;

client.once("ready", async () => {
  await client.application.commands.create({
    name: "help",
    description: "Get information about this bot",
  });

  console.log("Help command registered globally!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "help") {
    const helpMessage = `This bot responds with savage Gen Z roasts and answers to your queries if it contains "ligma". It is powered by Llama 3.3 70B. Created by [ankit.eth](https://discord.com/users/492673876472627200)`;

    await interaction.reply({
      content: helpMessage,
      suppressEmbeds: true,
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.content.toLowerCase().includes("ligma")) return;

  const messageWithoutLigma = message.content
    .toLowerCase()
    .replace("ligma", "")
    .trim();

  const senderName = message.author.username;

  const prompt = `${messageWithoutLigma} (Respond with savage Gen Z roast in maximum 5 lines, maximum sarcasm, and maximum roast energy. Be harsh, offensive, and meme-style. After roasting, answer.)`;

  try {
    const response = await axios.get(API_URL + encodeURIComponent(prompt));
    const botReply =
      response.data.message ||
      "Your internet must be on a coffee break. It’s taking forever to load. ☕";
    message.reply(`${senderName}, ${botReply}`);
  } catch (error) {
    console.error("Error fetching from Llama API:", error);
    message.reply(
      "Ligma servers are down. Guess you got no friends to blame. 💀"
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
