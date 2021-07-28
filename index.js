const Discord = require("discord.js");
const disbut = require("discord-buttons");
const client = new Discord.Client();
disbut(client);
const mongoose = require("./database/mongoose");
const fs = require("fs");
require("dotenv").config();
client.commands = new Discord.Collection();
const Guild = require("./database/models/guildSchema");

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

mongoose.init();
client.login(process.env.TOKEN);
