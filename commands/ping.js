module.exports = {
  name: "ping",
  description: "Ping!",
  execute(message, args, client) {
    message.channel.send("Pong.");
  },
};
