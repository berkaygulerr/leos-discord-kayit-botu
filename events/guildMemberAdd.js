const Guild = require("../database/models/guildSchema");
const Discord = require("discord.js");

const setMemberRole = async (member, guildProfile) => {
  let role = await member.guild.roles.cache.get(guildProfile.memberRoleID);
  if (role)
    member.roles.add(role).catch((x) => {
      if (x.message.includes("MISSING")) {
        message.reply("Botun yetkisi bu rolü vermeye yetmiyor.");
      }
    });
};

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    //if (member.user.bot) return;

    var guildProfile = await Guild.findOne({ guildID: member.guild.id });

    setMemberRole(member, guildProfile);

    if (guildProfile.welcomeChannelID) {
      let date = member.user.createdAt;
      let daySubtract = parseInt(
        (Date.now() - member.user.createdAt) / 1000 / 60 / 60 / 24
      );

      var embed = new Discord.MessageEmbed()
        .setTitle(
          `${member.user.username} Aramıza Hoş Geldin, Seni Burada Görmek Ne Güzel :partying_face:`
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(
          `<@!${member.user.id}> Hoş geldin, seninle birlikte artık **${member.guild.memberCount}** kişiyiz!`
        )
        .addFields(
          {
            name: "Kayıt olmak için yetkilileri beklemen yeterlidir.",
            value:
              "Hesap oluşturulma tarihi: " +
              "`" +
              `${date.toLocaleString("tr-TR")}` +
              "`",
          },
          { name: "ID:", value: "`" + member.user.id + "`" },
          {
            name: "Hesap güvenilirliği:",
            value:
              Date.now() - member.user.createdAt < 1000 * 60 * 60 * 24 * 15
                ? "`Şüpheli! (Hesap sadece " +
                  daySubtract +
                  " gün önce açılmış!)`"
                : "`Güvenilir!`",
          }
        )
        .setTimestamp()
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setColor("BLUE");

      let welcomeChannel = member.guild.channels.cache.get(
        guildProfile.welcomeChannelID
      );

      var roleIDs = [];
      var roleMentions = [];
      var roles = "";

      if (guildProfile.registerTagRoleIDs.length) {
        if (guildProfile.registerTagRoleIDs.length > 1) {
          guildProfile.registerTagRoleIDs.map((role) => {
            roleIDs.push(role);
            roleMentions.push(`<@&${role}>`);
          });

          roles = roleMentions.join(" ");
        } else {
          let role = guildProfile.registerTagRoleIDs;

          roleIDs.push(role);
          roles = `<@&${role}>`;
        }
      } else {
        if (guildProfile.registerRoleIDs.length > 1) {
          guildProfile.registerRoleIDs.map((role) => {
            roleIDs.push(role);
            roleMentions.push(`<@&${role}>`);
          });

          roles = roleMentions.join(" ");
        } else {
          let role = guildProfile.registerRoleIDs;

          roleIDs.push(role);
          roles = `<@&${role}>`;
        }
      }

      welcomeChannel.send(`> <@!${member.user.id}> Hoş geldin :partying_face:`);
      welcomeChannel.send(roles);
      welcomeChannel.send(embed);
    }
  },
};
