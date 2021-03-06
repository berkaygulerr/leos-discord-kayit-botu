const mongoose = require("mongoose");
const Guild = require("../database/models/guildSchema");
const Discord = require("discord.js");

var states = {
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

var setup = false;
var setupState = "";

var kurulumAuthor = "";

module.exports = {
  name: "message",
  async execute(message, client) {
    if (message.author.bot) return;
    if (message.channel.type == "dm") return;

    let guildProfile = await Guild.findOne({ guildID: message.guild.id });

    if (!guildProfile) {
      guildProfile = await new Guild({
        _id: mongoose.Types.ObjectId(),
        guildID: message.guild.id,
      });
      await guildProfile.save().catch((err) => console.log(err));
    }

    client.prefix = guildProfile.prefix;

    if (!message.content.startsWith(client.prefix) && !setup) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (commandName === "kurulum") {
      kurulumAuthor = message.author.id;
      setup = true;
      setupState = states.ayarlar_yetki;
    }

    var role =
      message.guild.roles.cache.get(message.content) ||
      message.mentions.roles.first();

    var channel =
      message.guild.channels.cache.get(message.content) ||
      message.mentions.channels.first();

    if (
      (setup && commandName !== "kurulum" && message.mentions.roles) ||
      (setup && commandName !== "kurulum" && message.mentions.channels)
    ) {
      var roleIDs = [];
      var roleMentions = [];
      var roles = "";

      if (
        message.content.toLowerCase() === "iptal" &&
        message.author.id === kurulumAuthor
      ) {
        let embed = new Discord.MessageEmbed()
          .setTitle("Kurulum ??ptal Edilmi??tir")
          .addField(
            "Gerekli Ayarlar?? Yapmak Ve Kontrol Etmek ????in:",
            "`" + client.prefix + "ayarlar`"
          )
          .setColor("BLUE");

        setupState = "";
        setup = false;

        return message.channel.send(embed);
      }

      if (message.mentions.roles.size > 1) {
        message.mentions.roles.map((role) => {
          roleIDs.push(role.id);
          roleMentions.push(`<@&${role.id}>`);
        });

        roles = roleMentions.join(", ");
      } else if (message.mentions.roles.size === 1) {
        let role = message.mentions.roles.first();

        roleIDs.push(role.id);
        roles = `<@&${role.id}>`;
      }

      if (
        setupState === states.ayarlar_yetki &&
        roles != "" &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { settingsRoleIDs: roleIDs, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle(
            "T??m Ayarlar?? Yapabilecek Yetkili Rolleri Ba??ar??yla Ayarland??"
          )
          .setDescription(
            `Art??k ${roles} rollerine sahip yetkililer t??m ayarlarlamalar?? yapabilecek.\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Kay??t Yapabilmesini ??stedi??iniz Yetkili Rollerini Etiketleyiniz",
            "??rn: @Admin @Moderator\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .setColor("BLUE");

        setupState = states.kayit_yetki;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayit_yetki &&
        roles != "" &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { registerRoleIDs: roleIDs, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle("Kay??tlar?? Yapabilecek Yetkili Rolleri Ba??ar??yla Ayarland??")
          .setDescription(
            `Art??k ${roles} rollerine sahip yetkililer kay??tlar?? yapabilecek.(Sunucuya bir kullan??c?? kat??ld??????nda ${roles} rolleri etiketlenecektir)\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Sunucuya Yeni Bir ??ye Kat??ld??????nda Etiketlenmesini ??stedi??iniz Rolleri Etiketleyiniz.",
            "??rn: @kayitsorumlusu\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .setColor("BLUE");

        setupState = states.kayit_etiket;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayit_etiket &&
        roles != "" &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { registerTagRoleIDs: roleIDs, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle(
            "Yeni ??ye Geldi??inde Etiketlenecek Roller Ba??ar??yla Ayarland??"
          )
          .setDescription(
            `Art??k yeni ??ye geldi??inde ${roles} rolleri etiketlenecek.\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullan??cy?? Kay??t Ederken ??sim Ya?? Aras??na Eklenecek Sembol?? Yaz??n??z.",
            "??rn: | (Yoksaymak i??in **hay??r** veya **h** yaz??n??z.)\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .setColor("BLUE");

        setupState = states.kayit_sembol;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayit_sembol &&
        ["h", "hayir", "hay??r"].includes(message.content.toLowerCase()) &&
        message.author.id === kurulumAuthor
      ) {
        let embed = new Discord.MessageEmbed()
          .setTitle("??sim Ya?? Aras??na Eklenecek Bir Sembol Ayarlanmad??")
          .setDescription(
            "`" +
              `${guildProfile.prefix}ayarlar ${states.kayit_sembol} sembol` +
              "` komutu ile daha sonra tekrar bir sembol ayarlayabilirsiniz.\n\n**S??radaki A??ama:**"
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Sunucuya Bir Kullan??c?? Kat??ld??????nda Otomatik Verilmesini ??stedi??iniz Kay??ts??z ??ye Rol??n?? Etiketleyiniz",
            "??rn: @Kayitsiz\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .setColor("BLUE");

        setupState = states.kayitsiz_rol;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayit_sembol &&
        !["h", "hayir", "hay??r"].includes(message.content.toLowerCase()) &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { registerSymbole: message.content, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle(
            "Kay??t Yap??l??rken ??sim Ya?? Aras??na Eklenecek Sembol Ba??ar??yla Ayarland??"
          )
          .setDescription(
            `Art??k kay??t yap??ld??ktan sonra kay??t yap??lan kullan??c??n??n isim ve ya????n??n aras??na otomatik ${message.content} sembol?? eklenecektir.\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Sunucuya Bir Kullan??c?? Kat??ld??????nda Otomatik Verilmesini ??stedi??iniz Kay??ts??z ??ye Rol??n?? Etiketleyiniz",
            "??rn: @Kayitsiz\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .setColor("BLUE");

        setupState = states.kayitsiz_rol;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayitsiz_rol &&
        roles != "" &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { memberRoleID: role.id, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle("Kay??ts??z ??ye Rol?? Ba??ar??yla Ayarland??")
          .setDescription(
            `Art??k sunucuya bir kullan??c?? kat??ld??????nda <@&${role.id}> rol?? verilecek.\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullan??c??n??n Kayd?? Yap??ld??????nda Verilmesini ??stedi??iniz Kay??tl?? ??ye Rol??n?? Etiketleyiniz",
            "??rn: @??ye\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .setColor("BLUE");

        setupState = states.kayitli_rol;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayitli_rol &&
        roles != "" &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { registeredRoleID: role.id, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle("Kay??tl?? ??ye Rol?? Ba??ar??yla Ayarland??")
          .setDescription(
            `Art??k bir kullan??c??n??n kayd?? yap??ld??????nda <@&${role.id}> rol?? verilecek.\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullan??c??n??n Kayd?? Yap??ld??????nda Bildirilmesini ??stedi??iniz Kay??t Bildirim Kanal??n?? Etiketleyiniz",
            "??rn: #kayit-bildirim\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .addField(
            "Kay??t",
            "Bir kullan??c??y?? kay??t etmek i??in:\n" +
              "`" +
              guildProfile.prefix +
              "kayit @kullan??c?? isim`"
          )
          .setColor("BLUE");

        setupState = states.kayit_kanal;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayit_kanal &&
        channel &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { registerChannelID: channel.id, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle("Kay??t Bildirim Kanal?? Ba??ar??yla Ayarland??")
          .setDescription(
            `Bir kullan??c??n??n kayd?? yap??ld??????nda <#${channel.id}> kanal??nda bildirilecektir.\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Sunucuya Bir Kullan??c?? Kat??ld??????nda Bildirilmesini ??stedi??iniz Yeni ??ye Bildirim Kanal??n?? Etiketleyiniz",
            "??rn: #hosgeldiniz\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .setColor("BLUE");

        setupState = states.yeni_uye_kanal;

        return message.channel.send(embed);
      } else if (
        setupState === states.yeni_uye_kanal &&
        channel &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { welcomeChannelID: channel.id, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle("Yeni ??ye Bildirim Kanal?? Ba??ar??yla Ayarland??")
          .setDescription(
            `Sunucuya bir kullan??c?? kat??ld??????nda <#${channel.id}> kanal??nda bildirilecektir.\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Cinsiyet Kay??t Sistemini Aktifle??tirmek istiyor musunuz",
            "Evet i??in **e** Hay??r i??in **h** yaz??n??z.\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .setColor("BLUE");

        setupState = states.cinsiyet_kayit;

        return message.channel.send(embed);
      } else if (
        setupState === states.cinsiyet_kayit &&
        ["h", "hay??r", "hayir"].includes(message.content.toLowerCase()) &&
        message.author.id === kurulumAuthor
      ) {
        let embed = new Discord.MessageEmbed()
          .setTitle("Cinsiyet Sistemi Aktifle??tirilmedi")
          .setDescription("Kurulum a??amas?? ba??ar??yla tamamlanm????t??r.")
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Gerekli Ayarlar?? Yapmak Ve Kontrol Etmek ????in:",
            "`" + client.prefix + "ayarlar`"
          )
          .setColor("BLUE");

        setupState = "";
        setup = false;

        return message.channel.send(embed);
      } else if (
        setupState === states.cinsiyet_kayit &&
        ["e", "evet"].includes(message.content.toLowerCase()) &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { genderRole: true, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle("Cinsiyet Sistemi Aktifle??tirildi")
          .setDescription(
            "Art??k kullan??c??lar?? cinsiyete g??re kay??t edebilirsiniz.\n\n**S??radaki A??ama:**`"
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullan??c?? Erkek Olarak Kay??t Edildi??inde Verilmesini ??stedi??iniz Erkek ??ye Rol??n?? Etiketleyiniz",
            "??rn: @Erkek\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .addField(
            "Cinsiyete G??re Kay??t",
            "Bir kullan??c??y?? cinsiyete g??re kay??t etmek i??in:\n" +
              "`" +
              guildProfile.prefix +
              "kayit cinsiyet(erkek, k??z) @kullan??c?? isim`"
          )
          .setColor("BLUE");

        setupState = states.erkek_rol;

        return message.channel.send(embed);
      } else if (
        setupState === states.erkek_rol &&
        roles != "" &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { boyRoleID: role.id, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle("Erkek ??ye Rol?? Ba??ar??yla Ayarland??")
          .setDescription(
            `Art??k bir kullan??c?? erkek olarak kay??t edildi??inde <@&${role.id}> rol?? verilecek.\n\n**S??radaki A??ama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullan??c?? K??z Olarak Kay??t Edildi??inde Verilmesini ??stedi??iniz K??z ??ye Rol??n?? Etiketleyiniz",
            "??rn: @K??z\n\nKurulumu iptal etmek i??in **iptal** yaz??n??z."
          )
          .addField(
            "Erkek Olarak Kay??t",
            "Bir kullan??c??y?? erkek olarak kay??t etmek i??in:\n" +
              "`" +
              guildProfile.prefix +
              "kayit erkek @kullan??c?? isim`"
          )
          .setColor("BLUE");

        setupState = states.kiz_rol;

        return message.channel.send(embed);
      } else if (
        setupState === states.kiz_rol &&
        roles != "" &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { girlRoleID: role.id, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle("K??z ??ye Rol?? Ba??ar??yla Ayarland??")
          .setDescription(
            `Art??k bir kullan??c?? k??z olarak kay??t edildi??inde <@&${role.id}> rol?? verilecek.\n\n**Kurulum A??amas?? Ba??ar??yla tamamlanm????t??r.**`
          )
          .addField(
            "Gerekli Ayarlar?? Yapmak Ve Kontrol Etmek ????in:",
            "`" + client.prefix + "ayarlar`"
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "K??z Olarak Kay??t",
            "Bir kullan??c??y?? k??z olarak kay??t etmek i??in:\n" +
              "`" +
              guildProfile.prefix +
              "kayit k??z @kullan??c?? isim`"
          )
          .setColor("BLUE");

        setupState = "";
        setup = false;

        return message.channel.send(embed);
      }
    }

    if (!command && !setup) return;

    if (!setup) {
      if (command.args && !args.length) {
        // Komutta arg??man gerekti??i halde arg??man verilmediyse ??al????acak
        let reply = `Herhangi bir arg??man sa??lamad??n??z, ${message.author}!`;

        if (command.usage) {
          reply += `\nDo??ru kullan??m ????yle olacakt??r: \`${client.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
      }
    }

    try {
      command.execute(message, args, client);
    } catch (error) {
      if (!setup) {
        console.error(error);
        message.reply("bu komutu y??r??tmeye ??al??????rken bir hata olu??tu!");
      }
    }
  },
};
