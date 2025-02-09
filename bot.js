import {
  Client,
  GatewayIntentBits,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
} from "discord.js";
import axios from "axios";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const API_URL = process.env.API_URL;

client.once("ready", async () => {
  try {
    const commands = [
      new ContextMenuCommandBuilder()
        .setName("Roast this message")
        .setType(ApplicationCommandType.Message),
      new ContextMenuCommandBuilder()
        .setName("Praise this message")
        .setType(ApplicationCommandType.Message),
      new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get information about this bot"),
      new SlashCommandBuilder()
        .setName("meme")
        .setDescription("Get a random meme")
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Choose a meme category")
            .setRequired(false)
            .addChoices(
              { name: "General", value: "memes" }, // r/memes
              { name: "Tech", value: "techmemes" }, // r/techmemes
              { name: "Gaming", value: "gamingmemes" }, // r/gamingmemes
              { name: "Programming", value: "ProgrammerHumor" }, // r/ProgrammerHumor
              { name: "AI", value: "AImemes" }, // r/AImemes
              { name: "Crypto", value: "cryptomemes" }, // r/cryptomemes
              { name: "Dark Humor", value: "dankmemes" }, // r/dankmemes
              { name: "Dank", value: "dankmemes" }, // r/dankmemes (same as dark humor)
              { name: "Anime", value: "Animemes" }, // r/Animemes
              { name: "Science", value: "sciencememes" }, // r/sciencememes
              { name: "Cursed", value: "cursedcomments" }, // r/cursedcomments
              { name: "Developer", value: "programminghorror" } // r/programminghorror
            )
        ),
    ];

    await client.application.commands.set(commands);
    console.log("✅ Commands registered!");
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "help") {
      await interaction.reply({
        content: `
        **🤖 Ligma Bot Help Menu**  

This bot is designed to deliver savage Gen Z roasts, witty comebacks, and fun meme-related features.  

🔥 **Auto Roast** – If your message contains "ligma", expect a comeback.  

🎭 **Roast/Praise Commands** – Right-click a message → Apps → "Roast this message" or "Praise this message".  

📜 **Slash Commands:**  
- \`/help\` – Displays this menu.  
- \`/meme\` – Fetches a random meme from various categories like tech, gaming, programming, AI, crypto, dark humor, etc.  

🛠 **Created by:** <@492673876472627200>.`,
        ephemeral: false,
        allowed_mentions: { parse: [] },
      });
      return;
    }

    if (interaction.commandName === "meme") {
      await interaction.deferReply();

      const category = interaction.options.getString("category") || "memes";
      const apiURL = `https://meme-api.com/gimme/${category}`;

      try {
        const response = await fetch(apiURL);
        const data = await response.json();

        if (!data.url || data.nsfw) {
          await interaction.editReply("Couldn't find a good meme. Try again later! 😢");
          return;
        }

        await interaction.editReply({
          content: `**${data.title}**\n(Source: r/${data.subreddit})`,
          embeds: [{ image: { url: data.url } }],
        });
      } catch (error) {
        console.error("Error fetching meme:", error);
        await interaction.editReply("Failed to fetch a meme. Meme API might be down! 🚨");
      }
    }
  }

  if (!interaction.isMessageContextMenuCommand()) return;

  const message = interaction.targetMessage;
  const targetUser = message.author;

  if (interaction.commandName === "Roast this message") {
    await interaction.deferReply();

    const prompt = `Roast ${targetUser.username} based on their message: "${message.content}". Use a Gen Z meme style with max sarcasm, personal insults, and pure savage energy. Keep it under 5 lines.`;

    try {
      const response = await axios.get(API_URL + encodeURIComponent(prompt));
      const roastReply =
        response.data.message?.split("\n").slice(0, 5).join("\n") ||
        "Even my AI is struggling to find words for how mid this is. 💀";

      await interaction.editReply(`${targetUser.username}, ${roastReply}`);
    } catch (error) {
      console.error("Error fetching from Llama API:", error);
      await interaction.editReply("Ligma servers are down. Try again later. 💀");
    }
  }

  if (interaction.commandName === "Praise this message") {
    await interaction.deferReply();

    const prompt = `Praise ${targetUser.username} based on their message: "${message.content}". Make them feel appreciated and loved. Keep it under 5 lines.`;

    try {
      const response = await axios.get(API_URL + encodeURIComponent(prompt));
      const praiseReply =
        response.data.message?.split("\n").slice(0, 5).join("\n") ||
        "You're honestly amazing, no AI-generated text needed for that. 🌟";

      await interaction.editReply(`${targetUser.username}, ${praiseReply}`);
    } catch (error) {
      console.error("Error fetching from Llama API:", error);
      await interaction.editReply("Praise servers are down. But just know, you're awesome. 💖");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
