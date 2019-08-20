//https://discordapp.com/oauth2/authorize?client_id=541368525659439108&scope=bot

const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
const embedColor = "#4286f4";

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function getRandomColor() {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = num >> 8 & 255;
    var b = num & 255;
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function randomID() {
    return (Math.random() * (999999 - 100000) + 100000);
}

bot.on("ready", async () => {
    console.log(`${bot.user.username} is online!`);
    bot.user.setActivity("play.darkcrestmc.net");
});

bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type == "dm") return;

    //!say Hello
    //! - prefix
    //say - cmd
    //Hello - args
    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    let role = message.guild.roles.find("name", "Discord Admin");
    let role2 = message.guild.roles.find("name", "@everyone");

    if (cmd === `${prefix}help`) {
        let helpEmbed = new Discord.RichEmbed()
              .setTitle("DCTickets Help Page")
              .setDescription("DarkcrestMC\'s nice ticket bot. Please make suggestions in #suggestions!")
              .setColor(embedColor)
              .addField(`${prefix}help`, "Show this help menu.")
              .addField(`${prefix}new`, "Create a new ticket with the indicated reason.")
              .addField(`${prefix}close`, "Closes the current ticket you are in.")
              .addField(`${prefix}add`, "Add someone to the current ticket.")
              .addField(`${prefix}remove`, "Remove someone from the current ticket.")
              .setTimestamp();
        message.channel.send(helpEmbed);
    }
    if (cmd === `${prefix}new`) {
        if (args.length === 0) {

          return  message.channel.send("You must specify a reason!")

        } else {
            const reason = args.join(" ");
            let ticketName = "ticket-" + randomID();
            message.guild.createChannel(`${ticketName}`, "text").then(c => {
                c.overwritePermissions(role, {
                    SEND_MESSAGES: true,
                    READ_MESSAGES: true
                });
                c.overwritePermissions(role2, {
                    SEND_MESSAGES: false,
                    READ_MESSAGES: false
                });
                c.overwritePermissions(message.member, {
                   SEND_MESSAGES: true,
                   READ_MESSAGES: true
                });
				const introToStaff = new Discord.RichEmbed().setColor(embedColor).addField("Author", `${message.member.displayName}`).addField("Reason", `${reason}`).setTimestamp();
                const introToUser = new Discord.RichEmbed().setColor(embedColor).addField(`Howdy, ${message.member.displayName}!`, "Please explain, in detail, why you opened this ticket.").setTimestamp();
                c.send({
                    embed: introToStaff
                });
				c.send({
					embed: introToUser
				});

				let category = bot.channels.find(channel => channel.name == "tickets" && channel.type==="category");

				c.setParent(category.id);
            }).catch(console.error);
            message.channel.lastMessage.delete();
        }
    }
    if (cmd === `${prefix}close`) {
        if (!message.channel.name.startsWith("ticket-")) {
            return message.channel.send("You cannot use this command outside of a ticket channel.");
        } else {
            let mess = [];
                message.channel.send(`Are you sure? Once confirmed, you cannot reverse this.\n\nTo confirm, type ${prefix}confirm. This will time out in 10 seconds.`)
                .then((m) => {
                    message.channel.awaitMessages(response => response.content === `${prefix}confirm`, {
                        max: 1,
                        time: 10000,
                        errors: ['time'],
                    })
                        .then((collected) => {
                            message.guild.channels.find(c => c.name === "ticket-logs").send(message.channel.name.toUpperCase());

                            message.channel.fetchMessages({}).then((m) => {
                                mess.push(m);
                                var color = getRandomColor();
                                for (let [snowflake, messages] of mess) {
                                    let messageTranscript = new Discord.RichEmbed().setTitle(messages.author.username.toString()).setDescription(snowflake).setColor(color).addField("Message", messages);
                                    let ticketLogs = message.guild.channels.find(c => c.name === "ticket-logs");
                                    if(!ticketLogs){
                                        message.guild.createChannel("ticket-logs", "text").then(chan => {
                                            chan.send(messageTranscript);
                                        })
                                    } else {
                                        ticketLogs.send(messageTranscript);
                                    }
                                }

                            });
                            message.channel.delete().catch(console.error);
                        })
                        .catch(() => {
                            m.edit('Ticket close window timed out, the ticket will not be closed.').then(m2 => {
                                m2.delete();
                            }, 3000);
                        });
                });
        }
    }
    if (cmd === `${prefix}add`) {
        const toAdd = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));

        if (message.channel.users().contains(toAdd)) {
            message.send("User is already apart of channel!");
        } else {

        }
    }
    if (cmd === `${prefix}remove`) {
        const toRemove = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    }
});

bot.login(botconfig.token);
