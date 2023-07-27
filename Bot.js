require("dotenv/config");

const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const User = require("./schema/userSchema.js");

const Bot = () => {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    const Buttons = Markup.keyboard([
        ["®️ Register", "🔥 Add Keywords", "Your Keywords"],
        ["❌ Delete My Profile", "👥 Share", "📞 Feedback"],
        ["❌ Clear Your Keywords", "❌ Delete one Keyword"],
    ]).resize();

    const JobButtons = Markup.keyboard(["Done"]).resize();

    bot.start((ctx) => {
        return ctx.reply(`Welcome! ${ctx.chat.username}`, Buttons);
    });

    bot.hears("®️ Register", (ctx) => {
        axios
            .post(`${process.env.BASE_URL}/register`, {
                body: ctx.chat.id.toString(),
                name: ctx.chat.username,
            })
            .then((res) => {
                ctx.reply(res.data);
            })
            .catch((e) => {
                ctx.reply("An Error Occured! Please Try Again!");
                console.log(e);
            });
    });

    bot.hears("🔥 Add Keywords", (ctx) => {
        axios
            .patch(`${process.env.BASE_URL}/setJobFlag/true`, {
                body: ctx.chat.id.toString(),
            })
            .then((res) => {
                if (res.status === 200) {
                    ctx.reply("Send Me Titles and Click Done!", JobButtons);
                }
            })
            .catch((e) => {
                ctx.reply("An Error Occured! Please Try Again!");
                console.log(e);
            });
    });

    bot.hears("❌ Delete My Profile", (ctx) => {
        axios
            .patch(`${process.env.BASE_URL}/setFlag/true`, {
                body: ctx.chat.id.toString(),
            })
            .then((res) => {
                if (res.status === 200) {
                    ctx.reply(
                        "Are you Sure you want to Delete Your Account?",
                        Markup.keyboard(["/Yes", "/No"]).oneTime().resize()
                    );
                } else ctx.reply(res.data);
            })
            .catch((e) => {
                console.log(e);
            });
    });

    bot.hears("❌ Clear Your Keywords", (ctx) => {
        axios
            .patch(`${process.env.BASE_URL}/Clear`, {
                body: ctx.chat.id.toString(),
            })
            .then((res) => {
                if (res.status === 200) {
                    ctx.reply("Cleared!");
                } else ctx.reply(res.data);
            })
            .catch((e) => {
                console.log(e);
            });
    });

    bot.hears("❌ Delete one Keyword", (ctx) => {
        const words = new Array();
        axios
            .post(`${process.env.BASE_URL}/getKeywords`, {
                body: ctx.chat.id.toString(),
            })
            .then((res) => {
                if (res.status !== 201) {
                    res.data.keywords?.forEach((d) => {
                        words.push([Markup.button.callback(d, `${d}`)]);
                    });
                    ctx.reply(
                        "Select a Keyword to Delete",
                        Markup.inlineKeyboard(words)
                    );
                } else ctx.reply("Error, Please Try Again!");
            })
            .catch((e) => {
                console.log(e);
            });
    });

    bot.on("callback_query", (ctx) => {
        axios
            .patch(`${process.env.BASE_URL}/deleteKeyword`, {
                body: ctx.chat.id.toString(),
                key: ctx.callbackQuery.data,
            })
            .then((res) => {
                if (res.status === 200) {
                    ctx.reply("Deleted!", Buttons);
                } else ctx.reply(res.data);
            })
            .catch((e) => {
                console.log(e);
            });
    });

    bot.hears("/No", (ctx) => {
        axios
            .patch(`${process.env.BASE_URL}/setFlag/false`, {
                body: ctx.chat.id.toString(),
            })
            .then((response) => {
                if (response.status === 200) ctx.reply("Cancelled!", Buttons);
                else ctx.reply("Sorry an Error Occured!");
            });
    });

    bot.hears("/Yes", (ctx) => {
        axios
            .post(`${process.env.BASE_URL}/deleteProfile`, {
                body: ctx.chat.id.toString(),
            })
            .then((res) => {
                ctx.reply(res.data, Buttons);
            })
            .catch((e) => {
                console.log(e);
            });
    });

    bot.hears("Done", (ctx) => {
        axios
            .patch(`${process.env.BASE_URL}/setJobFlag/false`, {
                body: ctx.chat.id.toString(),
            })
            .then((res) => {
                ctx.reply("Done, You will recieve Jobs Soon!", Buttons);
            })
            .catch((e) => {
                console.log(e);
            });
    });

    bot.hears("Your Keywords", (ctx) => {
        axios
            .post(`${process.env.BASE_URL}/getKeywords`, {
                body: ctx.chat.id.toString(),
            })
            .then((res) => {
                if (res.status !== 201) {
                    var output = "";

                    res.data.keywords?.forEach((d) => {
                        output += `\n${d}\n`;
                    });
                    ctx.reply(`Your Keywords 🚀\n\n${output}`);
                } else ctx.reply("Error, Please Try Again!");
            })
            .catch((e) => {
                console.log(e);
            });
    });

    bot.hears("📞 Feedback", (ctx) => {
        ctx.reply("contact @idktbhtf");
    });

    bot.use((ctx) => {
        axios
            .post(`${process.env.BASE_URL}/returnJobFlag`, {
                body: ctx.chat.id.toString(),
            })
            .then((response) => {
                if (response.status === 200) {
                    if (response.data?.jobFlag) {
                        axios
                            .patch(`${process.env.BASE_URL}/setKeyWords`, {
                                body: ctx.chat.id.toString(),
                                key: ctx.message.text,
                            })
                            .then((response) => {
                                console.log(response);
                                if (response.status === 200)
                                    ctx.reply(
                                        "Added! Press Done When you Finish",
                                        JobButtons
                                    );
                                else ctx.reply("Sorry an Error Occured!");
                            });
                    }
                } else {
                    if (ctx.channelPost) {
                        if (ctx.channelPost.reply_markup)
                            var button =
                                ctx.channelPost.reply_markup
                                    .inline_keyboard[0][0];
                        console.log(button?.url);
                        const data = ctx.channelPost?.text;

                        const jTitle = data.substr(0, 9);

                        const title = data.substr(11).split("\n")[0];

                        User.find().then((response) => {
                            response.forEach((r) => {
                                if (jTitle === "Job Title") {
                                    r.keywords?.forEach((key) => {
                                        if (
                                            title
                                                .toLowerCase()
                                                .includes(key.toLowerCase())
                                        )
                                            bot.telegram.sendMessage(
                                                r.username,
                                                ctx.channelPost.text.slice(
                                                    0,
                                                    -90
                                                ) +
                                                    "\n" +
                                                    "To " +
                                                    ctx.channelPost.reply_markup
                                                        .inline_keyboard[0][0]
                                                        ?.text +
                                                    " " +
                                                    ctx.channelPost.reply_markup
                                                        .inline_keyboard[0][0]
                                                        ?.url
                                            );
                                    });
                                } else
                                    bot.telegram.sendMessage(
                                        r.username,
                                        "not freelance message"
                                    );
                            });
                        });
                    }
                }
            })
            .catch((e) => {
                console.log(e);
            });
    });

    bot.launch();
};

module.exports = Bot;
