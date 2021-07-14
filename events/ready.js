const Guild = require("../database/models/guildSchema");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} has logged into Discord.`);

    client.user.setActivity(
      `!kurulum, !ayarlar`
    );
  },
};
