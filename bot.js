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
              { name: "General", value: "memes" },
              { name: "Tech", value: "techmemes" },
              { name: "Gaming", value: "gamingmemes" },
              { name: "Programming", value: "ProgrammerHumor" },
              { name: "AI", value: "AImemes" },
              { name: "Crypto", value: "cryptomemes" },
              { name: "Dark Humor", value: "dankmemes" },
              { name: "Wholesome", value: "wholesomememes" },
              { name: "Anime", value: "Animemes" },
              { name: "Cats", value: "catmemes" },
              { name: "Dogs", value: "dogmemes" },
              { name: "History", value: "HistoryMemes" },
              { name: "Science", value: "sciencememes" },
              { name: "Indian", value: "IndianDankMemes" }
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

This bot is designed to deliver savage Gen Z roasts, witty comebacks, and fun meme-related features. It includes:

🔥 **Auto Roast** – If your message contains "ligma", expect a comeback.

🎭 **Roast/Praise Commands** – Right-click a message → Apps → "Roast this message" or "Praise this message".

📜 **Slash Commands:**
- `/help` – Displays this menu.
- `/meme` – Fetches a random meme from Reddit.
- Supports categories like tech, gaming, programming, AI, crypto, etc.

🛠 **Created by:** <@492673876472627200>.`,
        ephemeral: false,
        allowed_mentions: { parse: [] },
        flags: 1 << 2,
      });
    }

    if (interaction.commandName === "meme") {
      await interaction.deferReply();

      const category = interaction.options.getString("category") || "memes";
      const redditURL = `https://www.reddit.com/r/${category}/hot.json?limit=50`;

      try {
        const response = await fetch(redditURL);
        const data = await response.json();
        const posts = data.data.children
          .filter((post) => !post.data.over_18)
          .sort((a, b) => b.data.ups - a.data.ups);
        if (posts.length === 0) {
          await interaction.followUp(
            "Couldn't find any memes. Try again later! 😢"
          );
          return;
        }

        const topMemes = posts.slice(0, 10);
        const randomMeme =
          topMemes[Math.floor(Math.random() * topMemes.length)].data;

        const imageUrl =
          randomMeme.url_overridden_by_dest ||
          (randomMeme.preview
            ? randomMeme.preview.images[0].source.url.replace("&amp;", "&")
            : null);

        if (!imageUrl) {
          await interaction.followUp(
            "Couldn't fetch a valid meme image. Try again later! 😢"
          );
          return;
        }

        await interaction.followUp({
          content: `**${randomMeme.title}**`,
          embeds: [{ image: { url: imageUrl } }],
        });
      } catch (error) {
        console.error("Error fetching meme:", error);
        await interaction.followUp(
          "Failed to fetch a meme. Reddit might be down! 🚨"
        );
      }
      return;
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

      await interaction.followUp(`${targetUser.username}, ${roastReply}`);
    } catch (error) {
      console.error("Error fetching from Llama API:", error);
      await interaction.followUp("Ligma servers are down. Try again later. 💀");
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

      await interaction.followUp(`${targetUser.username}, ${praiseReply}`);
    } catch (error) {
      console.error("Error fetching from Llama API:", error);
      await interaction.followUp(
        "Praise servers are down. But just know, you're awesome. 💖"
      );
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
