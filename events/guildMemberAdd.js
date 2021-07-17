const Guild = require("../database/models/guildSchema");
const Discord = require("discord.js");

const setMemberRole = async (member, guildProfile) => {
  if (member.user.bot) return;

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
    if (member.user.bot) return;

    var guildProfile = await Guild.findOne({ guildID: member.guild.id });

    setMemberRole(member, guildProfile);

    if (guildProfile.welcomeChannelID) {
      let date = member.user.createdAt;

      var embed = new Discord.MessageEmbed()
        .setTitle(
          `${member.user.username} aramıza hoş geldin, seni burada görmek ne güzel :partying_face:`
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(
          `<@${member.user.id}> hoş geldin, seninle birlikte artık ${member.guild.memberCount} kişiyiz!`
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
          {
            name: "Hesap güvenilirliği:",
            value:
              Date.now() - member.user.createdAt < 1000 * 60 * 60 * 24 * 15
                ? "`Şüpheli! (Hesap sadece" +
                  Date.now() -
                  member.user.createdAt +
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

      welcomeChannel.send(roles);
      welcomeChannel.send(embed);
    }
  },
};
