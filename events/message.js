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
          .setTitle("Kurulum İptal Edilmiştir")
          .addField(
            "Gerekli Ayarları Yapmak Ve Kontrol Etmek İçin:",
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
            "Tüm Ayarları Yapabilecek Yetkili Rolleri Başarıyla Ayarlandı"
          )
          .setDescription(
            `Artık ${roles} rollerine sahip yetkililer tüm ayarlarlamaları yapabilecek.\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Kayıt Yapabilmesini İstediğiniz Yetkili Rollerini Etiketleyiniz",
            "örn: @Admin @Moderator\n\nKurulumu iptal etmek için **iptal** yazınız."
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
          .setTitle("Kayıtları Yapabilecek Yetkili Rolleri Başarıyla Ayarlandı")
          .setDescription(
            `Artık ${roles} rollerine sahip yetkililer kayıtları yapabilecek.(Sunucuya bir kullanıcı katıldığında ${roles} rolleri etiketlenecektir)\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Sunucuya Yeni Bir Üye Katıldığında Etiketlenmesini İstediğiniz Rolleri Etiketleyiniz.",
            "örn: @kayitsorumlusu\n\nKurulumu iptal etmek için **iptal** yazınız."
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
            "Yeni Üye Geldiğinde Etiketlenecek Roller Başarıyla Ayarlandı"
          )
          .setDescription(
            `Artık yeni üye geldiğinde ${roles} rolleri etiketlenecek.\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullanıcyı Kayıt Ederken İsim Yaş Arasına Eklenecek Sembolü Yazınız.",
            "örn: | (Yoksaymak için **hayır** veya **h** yazınız.)\n\nKurulumu iptal etmek için **iptal** yazınız."
          )
          .setColor("BLUE");

        setupState = states.kayit_sembol;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayit_sembol &&
        ["h", "hayir", "hayır"].includes(message.content.toLowerCase()) &&
        message.author.id === kurulumAuthor
      ) {
        let embed = new Discord.MessageEmbed()
          .setTitle("İsim Yaş Arasına Eklenecek Bir Sembol Ayarlanmadı")
          .setDescription(
            "`" +
              `${guildProfile.prefix}ayarlar ${states.kayit_sembol} sembol` +
              "` komutu ile daha sonra tekrar bir sembol ayarlayabilirsiniz.\n\n**Sıradaki Aşama:**"
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Sunucuya Bir Kullanıcı Katıldığında Otomatik Verilmesini İstediğiniz Kayıtsız Üye Rolünü Etiketleyiniz",
            "örn: @Kayitsiz\n\nKurulumu iptal etmek için **iptal** yazınız."
          )
          .setColor("BLUE");

        setupState = states.kayitsiz_rol;

        return message.channel.send(embed);
      } else if (
        setupState === states.kayit_sembol &&
        !["h", "hayir", "hayır"].includes(message.content.toLowerCase()) &&
        message.author.id === kurulumAuthor
      ) {
        await Guild.findOneAndUpdate(
          { guildID: message.guild.id },
          { registerSymbole: message.content, lastEdited: Date.now() }
        );

        let embed = new Discord.MessageEmbed()
          .setTitle(
            "Kayıt Yapılırken İsim Yaş Arasına Eklenecek Sembol Başarıyla Ayarlandı"
          )
          .setDescription(
            `Artık kayıt yapıldıktan sonra kayıt yapılan kullanıcının isim ve yaşının arasına otomatik ${message.content} sembolü eklenecektir.\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Sunucuya Bir Kullanıcı Katıldığında Otomatik Verilmesini İstediğiniz Kayıtsız Üye Rolünü Etiketleyiniz",
            "örn: @Kayitsiz\n\nKurulumu iptal etmek için **iptal** yazınız."
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
          .setTitle("Kayıtsız Üye Rolü Başarıyla Ayarlandı")
          .setDescription(
            `Artık sunucuya bir kullanıcı katıldığında <@&${role.id}> rolü verilecek.\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullanıcının Kaydı Yapıldığında Verilmesini İstediğiniz Kayıtlı Üye Rolünü Etiketleyiniz",
            "örn: @Üye\n\nKurulumu iptal etmek için **iptal** yazınız."
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
          .setTitle("Kayıtlı Üye Rolü Başarıyla Ayarlandı")
          .setDescription(
            `Artık bir kullanıcının kaydı yapıldığında <@&${role.id}> rolü verilecek.\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullanıcının Kaydı Yapıldığında Bildirilmesini İstediğiniz Kayıt Bildirim Kanalını Etiketleyiniz",
            "örn: #kayit-bildirim\n\nKurulumu iptal etmek için **iptal** yazınız."
          )
          .addField(
            "Kayıt",
            "Bir kullanıcıyı kayıt etmek için:\n" +
              "`" +
              guildProfile.prefix +
              "kayit @kullanıcı isim`"
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
          .setTitle("Kayıt Bildirim Kanalı Başarıyla Ayarlandı")
          .setDescription(
            `Bir kullanıcının kaydı yapıldığında <#${channel.id}> kanalında bildirilecektir.\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Sunucuya Bir Kullanıcı Katıldığında Bildirilmesini İstediğiniz Yeni Üye Bildirim Kanalını Etiketleyiniz",
            "örn: #hosgeldiniz\n\nKurulumu iptal etmek için **iptal** yazınız."
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
          .setTitle("Yeni Üye Bildirim Kanalı Başarıyla Ayarlandı")
          .setDescription(
            `Sunucuya bir kullanıcı katıldığında <#${channel.id}> kanalında bildirilecektir.\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Cinsiyet Kayıt Sistemini Aktifleştirmek istiyor musunuz",
            "Evet için **e** Hayır için **h** yazınız.\n\nKurulumu iptal etmek için **iptal** yazınız."
          )
          .setColor("BLUE");

        setupState = states.cinsiyet_kayit;

        return message.channel.send(embed);
      } else if (
        setupState === states.cinsiyet_kayit &&
        ["h", "hayır", "hayir"].includes(message.content.toLowerCase()) &&
        message.author.id === kurulumAuthor
      ) {
        let embed = new Discord.MessageEmbed()
          .setTitle("Cinsiyet Sistemi Aktifleştirilmedi")
          .setDescription("Kurulum aşaması başarıyla tamamlanmıştır.")
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Gerekli Ayarları Yapmak Ve Kontrol Etmek İçin:",
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
          .setTitle("Cinsiyet Sistemi Aktifleştirildi")
          .setDescription(
            "Artık kullanıcıları cinsiyete göre kayıt edebilirsiniz.\n\n**Sıradaki Aşama:**`"
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullanıcı Erkek Olarak Kayıt Edildiğinde Verilmesini İstediğiniz Erkek Üye Rolünü Etiketleyiniz",
            "örn: @Erkek\n\nKurulumu iptal etmek için **iptal** yazınız."
          )
          .addField(
            "Cinsiyete Göre Kayıt",
            "Bir kullanıcıyı cinsiyete göre kayıt etmek için:\n" +
              "`" +
              guildProfile.prefix +
              "kayit cinsiyet(erkek, kız) @kullanıcı isim`"
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
          .setTitle("Erkek Üye Rolü Başarıyla Ayarlandı")
          .setDescription(
            `Artık bir kullanıcı erkek olarak kayıt edildiğinde <@&${role.id}> rolü verilecek.\n\n**Sıradaki Aşama:**`
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Bir Kullanıcı Kız Olarak Kayıt Edildiğinde Verilmesini İstediğiniz Kız Üye Rolünü Etiketleyiniz",
            "örn: @Kız\n\nKurulumu iptal etmek için **iptal** yazınız."
          )
          .addField(
            "Erkek Olarak Kayıt",
            "Bir kullanıcıyı erkek olarak kayıt etmek için:\n" +
              "`" +
              guildProfile.prefix +
              "kayit erkek @kullanıcı isim`"
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
          .setTitle("Kız Üye Rolü Başarıyla Ayarlandı")
          .setDescription(
            `Artık bir kullanıcı kız olarak kayıt edildiğinde <@&${role.id}> rolü verilecek.\n\n**Kurulum Aşaması Başarıyla tamamlanmıştır.**`
          )
          .addField(
            "Gerekli Ayarları Yapmak Ve Kontrol Etmek İçin:",
            "`" + client.prefix + "ayarlar`"
          )
          .setThumbnail(client.user.displayAvatarURL())
          .addField(
            "Kız Olarak Kayıt",
            "Bir kullanıcıyı kız olarak kayıt etmek için:\n" +
              "`" +
              guildProfile.prefix +
              "kayit kız @kullanıcı isim`"
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
        // Komutta argüman gerektiği halde argüman verilmediyse çalışacak
        let reply = `Herhangi bir argüman sağlamadınız, ${message.author}!`;

        if (command.usage) {
          reply += `\nDoğru kullanım şöyle olacaktır: \`${client.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
      }
    }

    try {
      command.execute(message, args, client);
    } catch (error) {
      if (!setup) {
        console.error(error);
        message.reply("bu komutu yürütmeye çalışırken bir hata oluştu!");
      }
    }
  },
};
