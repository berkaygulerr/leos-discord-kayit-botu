const Guild = require("../database/models/guildSchema");
const Discord = require("discord.js");

module.exports = {
  name: "ayarlar",
  description:
    "Sunucu sahibinin ve kurulum aşamasında belirlenen rollere sahip yetkililerin sunucuya özel, belirli ayarları yapabilmesini sağlar.",
  async execute(message, args, client) {
    const settingArgs = {
      prefix: "prefix",
      ayarlar_yetki: "ayarlar-yetki",
      kayit_yetki: "kayit-yetki",
      kayit_etiket: "kayit-etiket",
      kayitsiz_rol: "kayitsiz-rol",
      kayitli_rol: "kayitli-rol",
      kayit_sembol: "kayit-sembol",
      kayit_kanal: "kayit-kanal",
      yeni_uye_kanal: "yeni-uye-kanal",
      cinsiyet_kayit: "cinsiyet-kayit",
      erkek_rol: "erkek-rol",
      kiz_rol: "kiz-rol",
      reset: "reset",
    };

    var guildProfile = await Guild.findOne({ guildID: message.guild.id });

    var hasRoles = message.member.roles.cache.map((role) => {
      if (guildProfile.settingsRoleIDs.includes(role.id)) return true;
      else return false;
    });

    var hasRole = hasRoles.includes(true);

    if (message.author.id !== message.guild.ownerID && !hasRole) {
      return message.channel.send(
        "Bu komutu kullanabilecek kadar yetkili değilsin!"
      );
    }

    const fields = (settings) => {
      var field = "";

      // prefix field
      if (settings.name === settingArgs.prefix)
        return (field =
          guildProfile.prefix +
          "\nFarklı bir prefix ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar prefix <yeni prefix>`");
      // kayitsiz role field
      else if (settings.name === settingArgs.kayitsiz_rol && !settings.isNull)
        return (field =
          `<@&${
            settings.role ? settings.role : guildProfile.memberRoleID
          }>\nID: ` +
          "`" +
          `${settings.role ? settings.role : guildProfile.memberRoleID}` +
          "`" +
          "\nFarklı bir kayıtsız üye rolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayitsiz_rol +
          " @yeni rol`");
      // kayitsiz role field (null)
      else if (settings.name === settingArgs.kayitsiz_rol && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nKayıtsız üye rolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayitsiz_rol +
          " @rol`");
      // kayitli role field
      else if (settings.name === settingArgs.kayitli_rol && !settings.isNull)
        return (field =
          `<@&${
            settings.role ? settings.role : guildProfile.registeredRoleID
          }>\nID: ` +
          "`" +
          `${settings.role ? settings.role : guildProfile.registeredRoleID}` +
          "`" +
          "\nFarklı bir kayıtlı üye rolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayitli_rol +
          " @yeni rol`");
      // kayitli role field (null)
      else if (settings.name === settingArgs.kayitli_rol && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nKayıtlı üye rolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayitli_rol +
          " @rol`");
      // cinsiyet kayit system acik field
      else if (settings.name === settingArgs.cinsiyet_kayit && settings.isOpen)
        return (field =
          "Açık\nCinsiyet kayıt sistemini kapatmak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.cinsiyet_kayit +
          " kapalı`");
      // cinsiyet kayit system kapali field
      else if (settings.name === settingArgs.cinsiyet_kayit && !settings.isOpen)
        return (field =
          "Kapalı\nCinsiyet kayıt sistemini açmak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.cinsiyet_kayit +
          " açık`");
      // erkek role field
      else if (settings.name === settingArgs.erkek_rol && !settings.isNull)
        return (field =
          `<@&${
            settings.role ? settings.role : guildProfile.boyRoleID
          }>\nID: ` +
          "`" +
          `${settings.role ? settings.role : guildProfile.boyRoleID}` +
          "`" +
          "\nFarklı bir erkek üye rolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.erkek_rol +
          " @yeni rol`");
      // erkek role field (null)
      else if (settings.name === settingArgs.erkek_rol && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nErkek üye rolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.erkek_rol +
          " @rol`");
      // kız role field
      else if (settings.name === settingArgs.kiz_rol && !settings.isNull)
        return (field =
          `<@&${
            settings.role ? settings.role : guildProfile.girlRoleID
          }>\nID: ` +
          "`" +
          `${settings.role ? settings.role : guildProfile.girlRoleID}` +
          "`" +
          "\nFarklı bir erkek üye rolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.erkek_rol +
          " @yeni rol`");
      // kız role field (null)
      else if (settings.name === settingArgs.kiz_rol && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nKız üye rolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kiz_rol +
          " @rol`");
      // kayit channel field
      else if (settings.name === settingArgs.kayit_kanal && !settings.isNull)
        return (field =
          `<#${
            settings.channel ? settings.channel : guildProfile.registerChannelID
          }>\nID: ` +
          "`" +
          `${
            settings.channel ? settings.channel : guildProfile.registerChannelID
          }` +
          "`" +
          "\nFarklı bir kayıt bildirim kanalı ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayit_kanal +
          " #yeni kanal`");
      // kayit channel field (null)
      else if (settings.name === settingArgs.kayit_kanal && settings.isNull)
        return (field =
          "*Ayarlanmadı (Komutun verildiği kanal)*" +
          "\nKayıt bildirim kanalı ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayit_kanal +
          " #kanal`");
      // yeni uye channel field
      else if (settings.name === settingArgs.yeni_uye_kanal && !settings.isNull)
        return (field =
          `<#${
            settings.channel ? settings.channel : guildProfile.welcomeChannelID
          }>\nID: ` +
          "`" +
          `${
            settings.channel ? settings.channel : guildProfile.welcomeChannelID
          }` +
          "`" +
          "\nFarklı bir yeni üye bildirim kanalı ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.yeni_uye_kanal +
          " #yeni kanal`");
      // yeni uye channel field (null)
      else if (settings.name === settingArgs.yeni_uye_kanal && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nYeni üye bildirim kanalı ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.yeni_uye_kanal +
          " #kanal`");
      // ayarlar yetki role field
      else if (settings.name === settingArgs.ayarlar_yetki && !settings.isNull)
        return (field =
          settings.role +
          `\nID: ` +
          "`" +
          `${settings.ids}` +
          "`" +
          "\nAyarlar komutunu kullanabilecek farklı rolleri ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.ayarlar_yetki +
          " @yeni rol ve roller`");
      // ayarlar yetki role field (null)
      else if (settings.name === settingArgs.ayarlar_yetki && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nAyarlar komutunu kullanabilecek rolleri ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.ayarlar_yetki +
          " @rol veya roller`");
      // kayit yetki role field
      else if (settings.name === settingArgs.kayit_yetki && !settings.isNull)
        return (field =
          settings.role +
          `\nID: ` +
          "`" +
          `${settings.ids}` +
          "`" +
          "\nKayıt edebilecek farklı yetkili rollerini ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayit_yetki +
          " @yeni rol ve roller`");
      // kayit yetki role field (null)
      else if (settings.name === settingArgs.kayit_yetki && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nKayıt edebilecek yetkili rollerini ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayit_yetki +
          " @rol veya roller`");
      // kayit sembol field (null)
      else if (settings.name === settingArgs.kayit_sembol && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nKayıt yapılırken isim ve yaş arasına eklenecek sembolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayit_sembol +
          " sembol`");
      // kayit sembol field
      else if (settings.name === settingArgs.kayit_sembol && !settings.isNull)
        return (field =
          `${
            settings.symbole ? settings.symbole : guildProfile.registerSymbole
          }` +
          "\nKayıt yapılırken isim ve yaş arasına eklenecek sembolü ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayit_sembol +
          " yeni sembol`");
      // kayit etiket field
      else if (settings.name === settingArgs.kayit_etiket && !settings.isNull)
        return (field =
          settings.role +
          `\nID: ` +
          "`" +
          `${settings.ids}` +
          "`" +
          "\nSunucuya yeni üye geldiğinde etiketlenecek rolleri ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayit_etiket +
          " @yeni rol ve roller`");
      // kayit etiket field (null)
      else if (settings.name === settingArgs.kayit_etiket && settings.isNull)
        return (field =
          "*Ayarlanmadı*" +
          "\nSunucuya yeni üye geldiğinde etiketlenecek rolleri ayarlamak için:\n" +
          "`" +
          `${guildProfile.prefix}` +
          "ayarlar " +
          settingArgs.kayit_etiket +
          " @rol veya roller`");
    };

    const settingsRoleMentions = [];

    await guildProfile.settingsRoleIDs.map((roleID) => {
      settingsRoleMentions.push(`<@&${roleID}>`);
    });

    const settingsRoles = settingsRoleMentions.join(", ");
    const settIds = guildProfile.settingsRoleIDs.join("`, `");

    // ------------------------

    const registerRoleMentions = [];

    await guildProfile.registerRoleIDs.map((roleID) => {
      registerRoleMentions.push(`<@&${roleID}>`);
    });

    const registerRoles = registerRoleMentions.join(", ");
    const regIds = guildProfile.registerRoleIDs.join("`, `");

    // ------------------------

    const registerTagRoleMentions = [];

    await guildProfile.registerTagRoleIDs.map((roleID) => {
      registerTagRoleMentions.push(`<@&${roleID}>`);
    });

    const registerTagRoles = registerTagRoleMentions.join(", ");
    const regTagIds = guildProfile.registerTagRoleIDs.join("`, `");

    if (!args.length) {
      let embed = new Discord.MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setTitle(`Server Özel Ayarlar`)
        .setThumbnail(message.guild.iconURL())
        .setDescription(
          `${message.guild.name} server özel bulunan ve kişiselleştirilebilir ayarlar:`
        )
        .setColor("BLUE");

      if (guildProfile.prefix)
        embed.addField("Prefix: ", fields({ name: settingArgs.prefix }));

      if (settingsRoles != "") {
        embed.addField(
          "Ayarlar Komutunu Kullanabilecek Roller: ",
          fields({
            name: settingArgs.ayarlar_yetki,
            role: settingsRoles,
            ids: settIds,
          }),
          false
        );
      } else {
        embed.addField(
          "Ayarlar Komutunu Kullanabilecek Roller: ",
          fields({ name: settingArgs.ayarlar_yetki, isNull: true }),
          false
        );
      }

      if (registerRoles != "") {
        embed.addField(
          "Kayıt Edebilecek Yetkili Roller: ",
          fields({
            name: settingArgs.kayit_yetki,
            role: registerRoles,
            ids: regIds,
          }),
          false
        );
      } else {
        embed.addField(
          "Kayıt Edebilecek Yetkili Roller: ",
          fields({ name: settingArgs.kayit_yetki, isNull: true }),
          false
        );
      }

      if (registerTagRoles != "") {
        embed.addField(
          "Yeni Üye Geldiğinde Etiketlenecek Roller: ",
          fields({
            name: settingArgs.kayit_etiket,
            role: registerTagRoles,
            ids: regTagIds,
          }),
          false
        );
      } else {
        embed.addField(
          "Yeni Üye Geldiğinde Etiketlenecek Roller: ",
          fields({ name: settingArgs.kayit_etiket, isNull: true }),
          false
        );
      }

      if (guildProfile.registerSymbole) {
        embed.addField(
          "İsim Yaş Arasına Eklenecek Sembol: ",
          fields({ name: settingArgs.kayit_sembol }),
          true
        );
      } else {
        embed.addField(
          "İsim Yaş Arasına Eklenecek Sembol: ",
          fields({ name: settingArgs.kayit_sembol, isNull: true }),
          true
        );
      }

      embed.addField(
        "Kayıt",
        "Bir kullanıcıyı kayıt etmek için:\n" +
          "`" +
          guildProfile.prefix +
          "kayit @kullanıcı isim yaş`"
      );

      if (guildProfile.memberRoleID) {
        embed.addField(
          "Kayıtsız Üye Rolü: ",
          fields({ name: settingArgs.kayitsiz_rol }),
          true
        );
      } else {
        embed.addField(
          "Kayıtsız Üye Rolü: ",
          fields({ name: settingArgs.kayitsiz_rol, isNull: true }),
          true
        );
      }

      if (guildProfile.registeredRoleID) {
        embed.addField(
          "Kayıtlı Üye Rolü: ",
          fields({ name: settingArgs.kayitli_rol }),
          true
        );
      } else {
        embed.addField(
          "Kayıtlı Üye Rolü: ",
          fields({ name: settingArgs.kayitli_rol, isNull: true }),
          true
        );
      }

      if (guildProfile.registerChannelID) {
        embed.addField(
          "Kayıt Bildirim Kanalı: ",
          fields({ name: settingArgs.kayit_kanal })
        );
      } else {
        embed.addField(
          "Kayıt Bildirim Kanalı: ",
          fields({ name: settingArgs.kayit_kanal, isNull: true })
        );
      }

      if (guildProfile.welcomeChannelID) {
        embed.addField(
          "Yeni Üye Bildirim Kanalı: ",
          fields({ name: settingArgs.yeni_uye_kanal })
        );
      } else {
        embed.addField(
          "Yeni Üye Bildirim Kanalı: ",
          fields({ name: settingArgs.yeni_uye_kanal, isNull: true })
        );
      }

      if (guildProfile.genderRole) {
        embed.addField(
          "Cinsiyet Kayıt Sistemi: ",
          fields({ name: settingArgs.cinsiyet_kayit, isOpen: true })
        );

        embed.addField(
          "Cinsiyet Kayıt",
          "Bir kullanıcıyı cinsiyete göre kayıt etmek için:\n" +
            "`" +
            guildProfile.prefix +
            "kayit cinsiyet(erkek, kız) @kullanıcı isim yaş`"
        );

        if (guildProfile.boyRoleID) {
          embed.addField(
            "Erkek Üye Rolü: ",
            fields({ name: settingArgs.erkek_rol }),
            true
          );
        } else {
          embed.addField(
            "Erkek Üye Rolü: ",
            fields({ name: settingArgs.erkek_rol, isNull: true }),
            true
          );
        }

        if (guildProfile.girlRoleID) {
          embed.addField(
            "Kız Üye Rolü: ",
            fields({ name: settingArgs.kiz_rol }),
            true
          );
        } else {
          embed.addField(
            "Kız Üye Rolü: ",
            fields({ name: settingArgs.kiz_rol, isNull: true }),
            true
          );
        }
      } else {
        embed.addField(
          "Cinsiyet Kayıt Sistemi: ",
          fields({ name: settingArgs.cinsiyet_kayit })
        );
      }

      embed.addField(
        "Ayarları Sıfırla",
        "`" + guildProfile.prefix + "ayarlar reset`"
      );

      return message.channel.send(embed);
    }

    var role =
      message.guild.roles.cache.get(args[1]) || message.mentions.roles.first();

    var channel =
      message.guild.channels.cache.get(args[1]) ||
      message.mentions.channels.first();

    const roleIdError =
      "Sunucuda belirttiğiniz id ile ilişkili bir rol bulunmuyor!";

    const channelIdError =
      "Sunucuda belirttiğiniz id ile ilişkili bir kanal bulunmuyor!";

    if (!Object.values(settingArgs).includes(args[0]))
      return message.channel.send(
        "Bir ayarlama yapmak istiyorsanız geçerli bir özellik belirtmeniz gerekiyor!"
      );

    if (!args[1] && args[0] !== settingArgs.reset)
      return message.channel.send(
        "Bu ayarlamayı yapmak için bir değer belirtmediniz!"
      );

    if (args[0] === settingArgs.prefix) {
      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { prefix: args[1], lastEdited: Date.now() }
      );
      message.channel.send(`Prefix başarıyla ${args[1]} ile değiştirildi.`);
    } else if (args[0] === settingArgs.kayitsiz_rol) {
      if (!role) return message.channel.send(roleIdError);

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { memberRoleID: role.id, lastEdited: Date.now() }
      );

      let title = `Kayıtsız Üye Rolü Başarıyla Değiştirildi`;

      if (!guildProfile.memberRoleID)
        title =
          "Kayıtsız Üye Rolü Başarıyla Ayarlandı (Artık Kayıt Sistemi Aktif)";

      let embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(
          `Artık sunucuya katılan yeni üyeler otomatik <@&${role.id}> rolünü alacaktır.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE")
        .addField(
          "Kayıtsız Üye Rolü: ",
          fields({ name: settingArgs.kayitsiz_rol, role: role.id }),
          true
        );

      if (guildProfile.registeredRoleID) {
        embed.addField(
          "Kayıtlı Üye Rolü: ",
          fields({ name: settingArgs.kayitli_rol }),
          true
        );
      } else {
        embed.addField(
          "Kayıtlı Üye Rolü: ",
          fields({ name: settingArgs.kayitli_rol, isNull: true }),
          true
        );
      }

      message.channel.send(embed);
    } else if (args[0] === settingArgs.kayitli_rol) {
      if (!role) return message.channel.send(roleIdError);

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { registeredRoleID: role.id, lastEdited: Date.now() }
      );

      let title = `Kayıtlı Üye Rolü Başarıyla Değiştirildi`;

      if (!guildProfile.memberRoleID)
        title = "Kayıtlı Üye Rolü Başarıyla Ayarlandı";

      let embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(
          `Artık sunucuda kaydı yapılan üyeler <@&${role.id}> rolünü alacaktır.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE");

      if (guildProfile.memberRoleID) {
        embed.addField(
          "Kayıtsız Üye Rolü: ",
          fields({ name: settingArgs.kayitsiz_rol }),
          true
        );
      } else {
        embed.addField(
          "Kayıtsız Üye Rolü: ",
          fields({ name: settingArgs.kayitsiz_rol, isNull: true }),
          true
        );
      }

      embed.addField(
        "Kayıtlı Üye Rolü: ",
        fields({ name: settingArgs.kayitli_rol, role: role.id }),
        true
      );

      message.channel.send(embed);
    } else if (args[0] === settingArgs.cinsiyet_kayit) {
      if (["açık", "acik", "a"].includes(args[1])) {
        let title = "Cinsiyet Kayıt Sistemi Başarıyla Aktifleştirildi.";

        if (guildProfile.genderRole)
          title = "Cinsiyet Kayıt Sistemi Zaten Aktif!";
        else
          await Guild.findOneAndUpdate(
            { guildID: message.guild.id },
            { genderRole: true, lastEdited: Date.now() }
          );

        let embed = new Discord.MessageEmbed()
          .setTitle(title)
          .setDescription("Artık cinsiyete göre kayıt yapabilirsiniz.")
          .setThumbnail(client.user.displayAvatarURL())
          .setColor("BLUE")
          .addField(
            "Cinsiyet Kayıt Sistemi",
            fields({ name: settingArgs.cinsiyet_kayit, isOpen: true })
          );

        embed.addField(
          "Cinsiyet Kayıt",
          "Bir kullanıcıyı cinsiyete göre kayıt etmek için:\n" +
            "`" +
            guildProfile.prefix +
            "kayit cinsiyet(erkek, kız) @kullanıcı isin`"
        );

        if (guildProfile.boyRoleID) {
          embed.addField(
            "Erkek Üye Rolü: ",
            fields({ name: settingArgs.erkek_rol, isOpen: true }),
            true
          );
        } else {
          embed.addField(
            "Erkek Üye Rolü: ",
            fields({ name: settingArgs.erkek_rol, isNull: true }),
            true
          );
        }

        if (guildProfile.girlRoleID) {
          embed.addField(
            "Kız Üye Rolü: ",
            fields({ name: settingArgs.kiz_rol }),
            true
          );
        } else {
          embed.addField(
            "Kız Üye Rolü: ",
            fields({ name: settingArgs.kiz_rol, isNull: true }),
            true
          );
        }

        message.channel.send(embed);
      } else if (["kapalı", "kapali", "k"].includes(args[1])) {
        let title = "Cinsiyet Kayıt Sistemi Başarıyla Kapatıldı.";

        if (!guildProfile.genderRole)
          title = "Cinsiyet Kayıt Sistemi Zaten Kapalı!";
        else
          await Guild.findOneAndUpdate(
            { guildID: message.guild.id },
            { genderRole: false, lastEdited: Date.now() }
          );

        let embed = new Discord.MessageEmbed()
          .setTitle(title)
          .addField(
            "Cinsiyet Kayıt Sistemi: ",
            fields({ name: settingArgs.cinsiyet_kayit })
          )
          .setThumbnail(client.user.displayAvatarURL())
          .setColor("BLUE");

        message.channel.send(embed);
      }
    } else if (args[0] === settingArgs.erkek_rol && guildProfile.genderRole) {
      if (!role) return message.channel.send(roleIdError);

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { boyRoleID: role.id, lastEdited: Date.now() }
      );

      let embed = new Discord.MessageEmbed()
        .setTitle(`Erkek Üye Rolü Başarıyla Değiştirildi.`)
        .setDescription(
          `Artık kaydı yapılan erkek üyeler <@&${role.id}> rolünü alacaktır.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE")
        .addField(
          "Erkek Üye Rolü: ",
          fields({ name: settingArgs.erkek_rol, role: role.id }),
          true
        );

      if (guildProfile.girlRoleID) {
        embed.addField(
          "Kız Üye Rolü: ",
          fields({ name: settingArgs.kiz_rol }),
          true
        );
      } else {
        embed.addField(
          "Kız Üye Rolü: ",
          fields({ name: settingArgs.kiz_rol, isNull: true }),
          true
        );
      }

      message.channel.send(embed);
    } else if (args[0] === settingArgs.kiz_rol && guildProfile.genderRole) {
      if (!role) return message.channel.send(roleIdError);

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { girlRoleID: role.id, lastEdited: Date.now() }
      );

      let embed = new Discord.MessageEmbed()
        .setTitle(`Kız Üye Rolü Başarıyla Değiştirildi.`)
        .setDescription(
          `Artık kaydı yapılan kız üyeler <@&${role.id}> rolünü alacaktır.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE");

      if (guildProfile.boyRoleID) {
        embed.addField(
          "Erkek Üye Rolü: ",
          fields({ name: settingArgs.erkek_rol }),
          true
        );
      } else {
        embed.addField(
          "Erkek Üye Rolü: ",
          fields({ name: settingArgs.erkek_rol, isNull: true }),
          true
        );
      }

      embed.addField(
        "Kız Üye Rolü: ",
        fields({ name: settingArgs.kiz_rol, role: role.id }),
        true
      );

      message.channel.send(embed);
    } else if (args[0] === settingArgs.kayit_kanal) {
      if (!channel) return message.channel.send(channelIdError);

      let embed = new Discord.MessageEmbed()
        .setTitle("Kayıt Bildirim Kanalı Başarıyla Değiştirildi")
        .setDescription(
          `Artık bir kullanıcı kayıt edildiğinde <#${channel.id}> kanalında bildirilecektir.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE")
        .addField(
          "Kayıt Bildirim Kanalı: ",
          fields({ name: settingArgs.kayit_kanal, channel: channel.id })
        );

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { registerChannelID: channel.id, lastEdited: Date.now() }
      );

      message.channel.send(embed);
    } else if (args[0] === settingArgs.yeni_uye_kanal) {
      if (!channel) return message.channel.send(channelIdError);

      let embed = new Discord.MessageEmbed()
        .setTitle("Yeni Üye Bildirim Kanalı Başarıyla Değiştirildi")
        .setDescription(
          `Artık bir kullanıcı sunucuya katıldığında <#${channel.id}> kanalında bildirilecektir.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE")
        .addField(
          "Yeni Üye Bildirim Kanalı: ",
          fields({ name: settingArgs.yeni_uye_kanal, channel: channel.id })
        );

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { welcomeChannelID: channel.id, lastEdited: Date.now() }
      );

      message.channel.send(embed);
    } else if (args[0] === settingArgs.ayarlar_yetki) {
      const roleIDs = [];
      const roleMentions = [];

      await message.mentions.roles.map((role) => {
        roleIDs.push(role.id);
        roleMentions.push(`<@&${role.id}>`);
      });

      var ids = roleIDs.join("`, `");
      const roles = roleMentions.join(", ");

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { settingsRoleIDs: roleIDs, lastEdited: Date.now() }
      );

      let title = `Ayarlar Komutunu Kullanabilecek Roller Başarıyla Değiştirildi`;

      let embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(
          `Artık ${roles} rollerine sahip yetkililer ayarlar komutunu kullanabilecek.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE")
        .addField(
          "Ayarlar Komutunu Kullanabilecek Roller: ",
          fields({
            name: settingArgs.ayarlar_yetki,
            role: roles,
            ids: ids,
          }),
          true
        );

      message.channel.send(embed);
    } else if (args[0] === settingArgs.kayit_yetki) {
      const roleIDs = [];
      const roleMentions = [];

      await message.mentions.roles.map((role) => {
        roleIDs.push(role.id);
        roleMentions.push(`<@&${role.id}>`);
      });

      var ids = roleIDs.join("`, `");
      const roles = roleMentions.join(", ");

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { registerRoleIDs: roleIDs, lastEdited: Date.now() }
      );

      let title = `Kayıt Edebilecek Yetkili Rolleri Başarıyla Değiştirildi`;

      let embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(
          `Artık ${roles} rollerine sahip yetkililer kayıt yapabilecek.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE")
        .addField(
          "Kayıt Yapabilecek Yetkili Rolleri: ",
          fields({
            name: settingArgs.kayit_yetki,
            role: roles,
            ids: ids,
          }),
          true
        );

      message.channel.send(embed);
    } else if (args[0] === settingArgs.kayit_sembol) {
      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { registerSymbole: args[1], lastEdited: Date.now() }
      );

      let embed = new Discord.MessageEmbed()
        .setTitle(
          "Kayıt Yapılırken İsim Yaş Arasına Eklenecek Sembol Başarıyla Ayarlandı"
        )
        .setDescription(
          `Artık kayıt yapıldıktan sonra kayıt yapılan kullanıcının isim ve yaşının arasına otomatik ${args[1]} sembolü eklenecektir.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE")
        .addField(
          "İsim Yaş Arasına Eklenecek Sembol: ",
          fields({
            name: settingArgs.kayit_sembol,
            symbole: args[1],
          })
        );

      message.channel.send(embed);
    } else if (args[0] === settingArgs.kayit_etiket) {
      const roleIDs = [];
      const roleMentions = [];

      await message.mentions.roles.map((role) => {
        roleIDs.push(role.id);
        roleMentions.push(`<@&${role.id}>`);
      });

      var ids = roleIDs.join("`, `");
      const roles = roleMentions.join(", ");

      await Guild.findOneAndUpdate(
        { guildID: message.guild.id },
        { registerTagRoleIDs: roleIDs, lastEdited: Date.now() }
      );

      let title = `Yeni Üye Geldiğinde Etiketlenecek Roller Başarıyla Değiştirildi`;

      let embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(
          `Artık sunucuya yeni üye geldiğinde ${roles} rolleri etiketlenecektir.`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setColor("BLUE")
        .addField(
          "Yeni Üye Geldiğinde Etiketlenecek Roller: ",
          fields({
            name: settingArgs.kayit_etiket,
            role: roles,
            ids: ids,
          }),
          true
        );

      message.channel.send(embed);
    } else if (args[0] === settingArgs.reset) {
      // await Guild.findOneAndDelete({ guildID: message.guild.id });

      // message.channel.send("Tüm ayarlar başarıyla sıfırlandı!");

      message.channel.send(
        "Teknik bir sıkıntıdan dolayı bu komut askıya alınmıştır."
      );
    }
  },
};
