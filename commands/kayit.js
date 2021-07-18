const Guild = require("../database/models/guildSchema");
const Discord = require("discord.js");

module.exports = {
  name: "kayit",
  aliases: ["kayıt"],
  description: "Yeni gelen üyeleri kayıt eder.",
  async execute(message, args, client) {
    const settingArgs = {
      prefix: "prefix",
      kayitsiz_rol: "kayitsiz-rol",
      kayitli_rol: "kayitli-rol",
      kayit_kanal: "kayit-kanal",
      cinsiyet_kayit: "cinsiyet-kayit",
      erkek_rol: "erkek-rol",
      kiz_rol: "kiz-rol",
      reset: "reset",
    };

    var guildProfile = await Guild.findOne({ guildID: message.guild.id });

    var hasRoles = message.member.roles.cache.map((role) => {
      if (guildProfile.registerRoleIDs.includes(role.id)) return true;
      else return false;
    });

    var hasRole = hasRoles.includes(true);

    if (message.author.id !== message.guild.ownerID && !hasRole)
      return message.channel.send(
        "Bu komutu kullanabilecek kadar yetkili değilsin!"
      );

    var boyRole = message.guild.roles.cache.get(guildProfile.boyRoleID);
    var girlRole = message.guild.roles.cache.get(guildProfile.girlRoleID);
    var registeredRole = message.guild.roles.cache.get(
      guildProfile.registeredRoleID
    );

    if (!guildProfile.memberRoleID) {
      let embed = new Discord.MessageEmbed()
        .setTitle(
          "Kayıtsız Üye Rolü Ayarlanmadığı İçin Kayıt Sistemi Devre Dışı Durumda!"
        )
        .setDescription(
          "Kayıt sistemini aktifleştirmek için kayıtsız üye rolünü ayarlayın."
        )
        .setThumbnail(client.user.displayAvatarURL())
        .addField(
          "Kayıtsız Üye Rolü: ",
          `*Ayarlanmadı*\n` +
            "Kayıtsız üye rolü ayarlamak için:\n" +
            "`" +
            `${guildProfile.prefix}` +
            "ayarlar " +
            settingArgs.kayitsiz_rol +
            " @yeni rol`"
        )
        .setColor("BLUE");

      return message.channel.send(embed);
    }

    var registeredMember =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    var registerChannel = message.guild.channels.cache.get(
      guildProfile.registerChannelID
    );

    const registeredMemberRoles = [];

    var gendersCommands = ["erkek", "e", "kız", "kiz", "k"];

    if (guildProfile.genderRole && gendersCommands.includes(args[0])) {
      var newArgs = [...args];
      newArgs.splice(0, 2);
      var memberName = newArgs.join(" ");

      if (guildProfile.registerSymbole) {
        memberName = memberName.split(" ");
        memberName = memberName.join(` ${guildProfile.registerSymbole} `);
      }

      if (args.length < 3) {
        let embed = new Discord.MessageEmbed()
          .setTitle("Doğru kullanım şu şekildedir:")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription(
            "`" +
              guildProfile.prefix +
              "kayit cinsiyet(erkek, kız) @kullanıcı isim yaş`"
          )
          .setColor("BLUE");
        return message.channel.send(embed);
      }

      if (!gendersCommands.includes(args[0]))
        return message.channel.send(embed);

      if (!boyRole && ["erkek", "e"].includes(args[0])) {
        let embed = new Discord.MessageEmbed()
          .setTitle("Erkek üye rolü ayarlayınız!")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription(
            `<@${registeredMember.id}> isimli kullanıcıyı erkek olarak kayıt etmeden önce erkek üye rolü ayarlamalısınız.`
          )
          .addField(
            "Erkek Üye Rolü: ",
            `*Ayarlanmadı*` +
              "\nErkek üye rolü ayarlamak için:\n" +
              "`" +
              `${guildProfile.prefix}` +
              "ayarlar " +
              settingArgs.erkek_rol +
              " @yeni rol`"
          )
          .setColor("BLUE");

        return message.channel.send(embed);
      } else if (!girlRole && ["kız", "kiz", "k"].includes(args[0])) {
        let embed = new Discord.MessageEmbed()
          .setTitle("Kız üye rolü ayarlayınız!")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription(
            `<@${registeredMember.id}> isimli kullanıcıyı erkek olarak kayıt etmeden önce erkek üye rolü ayarlamalısınız.`
          )
          .addField(
            "Kız Üye Rolü: ",
            `*Ayarlanmadı*\n` +
              "Kız üye rolü ayarlamak için:\n" +
              "`" +
              `${guildProfile.prefix}` +
              "ayarlar " +
              settingArgs.kiz_rol +
              " @yeni rol`"
          )
          .setColor("BLUE");

        return message.channel.send(embed);
      }

      if (registeredRole) {
        await registeredMember.roles.add(registeredRole).catch((x) => {
          if (x.message.includes("Missing")) {
            return message.reply(
              "Botun yetkisi kayıtlı üye rolünü vermeye yetmiyor."
            );
          }
        });

        registeredMemberRoles.push(`<@&${registeredRole.id}>`);
      }
      if (["erkek", "e"].includes(args[0])) {
        await registeredMember.roles.add(boyRole).catch((x) => {
          if (x.message.includes("Missing")) {
            return message.reply(
              "Botun yetkisi erkek üye rolünü vermeye yetmiyor."
            );
          }
        });

        registeredMemberRoles.push(`<@&${boyRole.id}>`);
      } else if (["kız", "kiz", "k"].includes(args[0])) {
        await registeredMember.roles.add(girlRole).catch((x) => {
          if (x.message.includes("Missing")) {
            return message.reply(
              "Botun yetkisi kız üye rolünü vermeye yetmiyor."
            );
          }
        });

        registeredMemberRoles.push(`<@&${girlRole.id}>`);
      }

      await registeredMember.setNickname(memberName).catch((x) => {
        if (x.message.includes("Missing")) {
          return message.reply("Botun yetkisi isim değiştirmeye yetmiyor.");
        }
      });

      await registeredMember.roles.remove(guildProfile.memberRoleID);

      let roles = registeredMemberRoles.join(", ");
      if (roles === "") return;

      var registrationAmounts = await guildProfile.registrationAmounts;

      var hasRegistrant = registrationAmounts.some(
        (registrant) => registrant.id === message.author.id
      );

      if (!hasRegistrant) {
        let registrant = { id: message.author.id, count: 1 };

        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          {
            registrationAmounts: [...registrationAmounts, registrant],
            lastEdited: Date.now(),
          }
        );
      } else {
        let registrants = [...registrationAmounts];

        registrants.map((registrant) =>
          registrant.id === message.author.id ? (registrant.count += 1) : null
        );

        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          {
            registrationAmounts: registrants,
            lastEdited: Date.now(),
          }
        );
      }

      let lastGuildProfile = await Guild.findOne({ guildID: message.guild.id });

      let registrant = lastGuildProfile.registrationAmounts.filter(
        (registrant) => registrant.id === message.author.id
      )[0];

      var registeredEmbed = new Discord.MessageEmbed()
        .setAuthor("Kayıt başarıyla yapıldı", client.user.displayAvatarURL())
        .setTitle(
          `${registeredMember.user.username} Kullanıcısının Kaydı Başarıyla Yapıldı\n\nKayıt Bilgileri:`
        )
        .setThumbnail(registeredMember.user.displayAvatarURL())
        .addFields(
          {
            name: "Verilen Roller:",
            value: roles,
            inline: false,
          },
          {
            name: "Kaydı Yapan Yetkili:",
            value:
              `<@${message.author.id}>` +
              "\n`" +
              `${registrant.count}` +
              ". kayıt`",
            inline: true,
          },
          {
            name: "Kayıt Edilen Kullanıcı:",
            value: `<@${registeredMember.id}>`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setColor("BLUE");

      if (!registerChannel) return message.channel.send(registeredEmbed);

      return registerChannel.send(registeredEmbed);
    } else if (gendersCommands.includes(args[0])) {
      let embed = new Discord.MessageEmbed()
        .setTitle("Cinsiyet Kayıt Sistemi Devre Dışı Durumda!")
        .setDescription(
          "Bir kullanıcıyı cinsiyete göre kayıt etmek için cinsiyet kayıt sistemini aktifleştirin."
        )
        .addField(
          "Cinsiyet Kayıt Sistemi:",
          "Kapalı\nCinsiyet kayıt sistemini açmak için:\n" +
            "`" +
            `${guildProfile.prefix}` +
            "ayarlar " +
            settingArgs.cinsiyet_kayit +
            " açık`"
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE");

      message.channel.send(embed);
    } else {
      var newArgs = [...args];
      newArgs.splice(0, 1);
      var memberName = newArgs.join(" ");

      // replace last space character
      if (guildProfile.registerSymbole) {
        memberName = memberName.replace(
          / ([^ ]*)$/,
          ` ${guildProfile.registerSymbole} ` + `$1`
        );
      }

      let embed = new Discord.MessageEmbed()
        .setTitle("Doğru kullanım şu şekildedir:")
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(
          "`" + guildProfile.prefix + "kayit @kullanıcı isim yaş`"
        )
        .setColor("BLUE");
      if (args.length < 2) {
        return message.channel.send(embed);
      }

      if (!registeredRole) {
        let embed = new Discord.MessageEmbed()
          .setTitle("Kayıtlı Üye Rolü Ayarlayınız!")
          .setDescription(
            "Bir kullanıcıyı kayıt edebilmeniz için kayıtlı üye rolü ayarlayın."
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Kayıtlı Üye Rolü: ",
            `*Ayarlanmadı*\n` +
              "Kayıtlı üye rolü ayarlamak için:\n" +
              "`" +
              `${guildProfile.prefix}` +
              "ayarlar " +
              settingArgs.kayitli_rol +
              " @yeni rol`"
          )
          .setColor("BLUE");

        return message.channel.send(embed);
      }

      await registeredMember.roles.add(registeredRole).catch((x) => {
        if (x.message.includes("Missing")) {
          return message.reply(
            "Botun yetkisi kayıtlı üye rolünü vermeye yetmiyor."
          );
        }
      });
      await registeredMember.setNickname(memberName).catch((x) => {
        if (x.message.includes("Missing")) {
          return message.reply("Botun yetkisi isim değiştirmeye yetmiyor.");
        }
      });

      await registeredMember.roles.remove(guildProfile.memberRoleID);

      let roles = `<@&${registeredRole.id}>`;
      if (roles === "") return;

      var registrationAmounts = await guildProfile.registrationAmounts;

      var hasRegistrant = registrationAmounts.some(
        (registrant) => registrant.id === message.author.id
      );

      if (!hasRegistrant) {
        let registrant = { id: message.author.id, count: 1 };

        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          {
            registrationAmounts: [...registrationAmounts, registrant],
            lastEdited: Date.now(),
          }
        );
      } else {
        let registrants = [...registrationAmounts];

        registrants.map((registrant) =>
          registrant.id === message.author.id ? (registrant.count += 1) : null
        );

        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          {
            registrationAmounts: registrants,
            lastEdited: Date.now(),
          }
        );
      }

      let lastGuildProfile = await Guild.findOne({ guildID: message.guild.id });

      let registrant = lastGuildProfile.registrationAmounts.filter(
        (registrant) => registrant.id === message.author.id
      )[0];

      var registeredEmbed = new Discord.MessageEmbed()
        .setAuthor("Kayıt başarıyla yapıldı", client.user.displayAvatarURL())
        .setTitle(
          `${registeredMember.user.username} Kullanıcısının Kaydı Başarıyla Yapıldı\n\nKayıt Bilgileri:`
        )
        .setThumbnail(registeredMember.user.displayAvatarURL())
        .addFields(
          {
            name: "Verilen Roller:",
            value: roles,
            inline: false,
          },
          {
            name: "Kaydı Yapan Yetkili:",
            value:
              `<@${message.author.id}>` +
              "\n`" +
              `${registrant.count}` +
              ". kayıt`",
            inline: true,
          },
          {
            name: "Kayıt Edilen Kullanıcı:",
            value: `<@${registeredMember.id}>`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setColor("BLUE");

      if (!registerChannel) return message.channel.send(registeredEmbed);

      registerChannel.send(registeredEmbed);
    }
  },
};
