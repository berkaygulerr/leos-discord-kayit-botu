const Guild = require("../database/models/guildSchema");
const Discord = require("discord.js");
const disbut = require("discord-buttons");
const disbutpages = require("discord-embeds-pages-buttons");

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

    var count = 1;

    if (!args.length) {
      var registrantBySlice = [];
      var pages = [];

      var i,
        j,
        temporary,
        chunk = 5;
      for (i = 0, j = registrationAmounts.length; i < j; i += chunk) {
        temporary = registrationAmounts.slice(i, i + chunk);
        await registrantBySlice.push(temporary);
      }

      for (let i = 0; i < registrantBySlice.length; i++) {
        var countText = "";
        registrantBySlice[i].map((registrant) => {
          countText +=
            `**${count}.** <@${registrant.id}> kayıt sayısı: **${registrant.count}**\nID: ` +
            "`" +
            registrant.id +
            "`" +
            "\n\n";

          count++;
        });

        var embed = new Discord.MessageEmbed()
          .setAuthor(client.user.username, client.user.displayAvatarURL())
          .setTitle(`Kayıt Yetkililerinin Kayıt Sayıları`)
          .setThumbnail(message.guild.iconURL())
          .addField(
            "Kayıt Edebilen Yetkili Rolleri:",
            registerRoles + "\nID: " + "`" + `${regIds}` + "`"
          )
          .addField("SIRALAMA:", countText)
          .setColor("BLUE")
          .setFooter(`Sayfa ${i + 1}/${registrantBySlice.length}`);

        pages.push(embed);
      }

      if (registrantBySlice.length > 1) {
        disbutpages.pages(
          client,
          message,
          pages,
          100000,
          disbut,
          "grey",
          "⏩",
          "⏪",
          "❌"
        );
      } else {
        message.channel.send(pages[0]);
      }
    } else {
      var mentionMember =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);

      if (!mentionMember) {
        return message.channel.send("Geçerli bir kullanıcı belirtmediniz!");
      }

      let hasRegistrant = registrationAmounts.some(
        (registrant) => registrant.id === mentionMember.id
      );

      if (!hasRegistrant)
        return message.channel.send(
          "Belirttiğiniz kullanıcının kayıt sayısı bulunmamaktadır!"
        );

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
