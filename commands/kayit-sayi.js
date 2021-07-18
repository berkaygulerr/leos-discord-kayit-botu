const Guild = require("../database/models/guildSchema");
const Discord = require("discord.js");

module.exports = {
  name: "kayit-sayi",
  aliases: ["kayıt-sayı"],
  usage(guildProfile) {
    return (
      "`" +
      `${guildProfile.prefix}kayit-sayi\n${guildProfile.prefix}kayit-sayi @kullanıcı` +
      "`"
    );
  },
  description:
    "Etiketlenen yetkilinin kaç kişiyi kayıt ettiğini veya hangi yetkilinin ne kadar kayıt yaptığını görüntüler.",
  async execute(message, args, client) {
    var guildProfile = await Guild.findOne({ guildID: message.guild.id });

    const registerRoleMentions = [];
    const regIds = guildProfile.registerRoleIDs.join("`, `");

    await guildProfile.registerRoleIDs.map((roleID) => {
      registerRoleMentions.push(`<@&${roleID}>`);
    });

    const registerRoles = registerRoleMentions.join(", ");

    var registrationAmounts = guildProfile.registrationAmounts;
    registrationAmounts.sort((a, b) => b.count - a.count);

    var countText = "";
    var count = 1;

    if (!args.length) {
      registrationAmounts.map((registrant) => {
        countText +=
          `**${count}.** <@${registrant.id}> kayıt sayısı: **${registrant.count}**\nID: ` +
          "`" +
          registrant.id +
          "`" +
          "\n\n";

        count++;
      });

      let embed = new Discord.MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setTitle(`Kayıt Yetkililerinin Kayıt Sayıları`)
        .setThumbnail(message.guild.iconURL())
        .addField(
          "Kayıt Edebilen Yetkili Rolleri:",
          registerRoles + "\nID: " + "`" + `${regIds}` + "`"
        )
        .addField("SIRALAMA:", countText)
        .setColor("BLUE");

      message.channel.send(embed);
    } else {
      var mentionMember =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);

      let registrant = registrationAmounts.filter(
        (registrant) => registrant.id === mentionMember.id
      )[0];

      let order = registrationAmounts.indexOf(registrant) + 1;

      let embed = new Discord.MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setDescription(
          `**${order}.**  <@${registrant.id}> kayıt sayısı: **${registrant.count}**\nID: ` +
            "`" +
            registrant.id +
            "`"
        )
        .setColor("BLUE");

      message.channel.send(embed);
    }
  },
};
