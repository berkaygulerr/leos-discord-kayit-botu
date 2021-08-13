const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  guildID: String,
  lastEdited: String,
  prefix: { type: String, default: "!" },
  settingsRoleIDs: { type: Array, required: false },
  registerRoleIDs: { type: Array, required: false },
  registerTagRoleIDs: { type: Array, required: false },
  memberRoleID: { type: String, required: false },
  registeredRoleID: { type: String, required: false },
  registerChannelID: { type: String, required: false },
  registerSymbole: { type: String, required: false },
  registrationAmounts: { type: Array, required: false },
  welcomeChannelID: { type: String, required: false },
  genderRole: { type: Boolean, default: false },
  girlRoleID: { type: String, required: false },
  boyRoleID: { type: String, required: false },
});

module.exports = new mongoose.model("Guild", guildSchema, "guilds");
