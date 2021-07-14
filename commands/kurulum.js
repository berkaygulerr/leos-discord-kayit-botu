const Discord = require("discord.js");

module.exports = {
  name: "kurulum",
  description: "Botun servera kurulmasını sağlar.",
  async execute(message, args, client) {
    if (message.author.id !== message.guild.ownerID)
      return message.channel.send(
        "Kurulumu sadece sunucu sahibi yapabilir!"
      );

    let embed = new Discord.MessageEmbed()
      .setTitle(
        "Leos Bot Kurulumuna Hoşgeldiniz (Leos Botunun Rolünün Tüm Rollerden Üstün Olduğundan Emin Olunuz)"
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
        "Önce tüm ayarlamaları yapabilecek yetkili rollerini ayarlayınız."
      )
      .addField(
        "Ayarlamak İçin İstediğiniz Rolleri Etiketleyiniz",
        "örn: @Admin @Moderator\n\nKurulumu iptal etmek için **iptal** yazınız."
      )
      .setColor("BLUE");
    return message.channel.send(embed);
  },
};
