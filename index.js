const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot ist online als ${client.user.tag}`);
});

// REST-API-Endpunkt für Rückmeldung
app.get("/rolle/:id", async (req, res) => {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  const roleId = req.params.id;

  if (!guild) {
    return res.status(500).json({ error: "Guild nicht gefunden." });
  }

  try {
    await guild.members.fetch(); // wichtig: alle Mitglieder cachen
    const roleMembers = guild.members.cache
      .filter(member => member.roles.cache.has(roleId))
      .map(member => ({
        id: member.id,
        name: `${member.displayName} (${member.user.username})`,
        avatar: member.user.avatar
          ? `https://cdn.discordapp.com/avatars/${member.id}/${member.user.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/0.png`
      }));

    res.json(roleMembers);
  } catch (err) {
    console.error("Fehler beim Laden der Rolle:", err);
    res.status(500).json({ error: "Fehler beim Laden der Rolle." });
  }
});

// Root route (zum Testen)
app.get("/", (req, res) => {
  res.send("Bot läuft ✅");
});

// Start Webserver
app.listen(PORT, () => {
  console.log(`🌐 Webserver läuft auf http://localhost:${PORT}`);
});

// Starte den Bot
client.login(process.env.BOT_TOKEN);
