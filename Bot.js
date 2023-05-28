import "dotenv/config";
import { Telegraf, Markup } from "telegraf";
import axios from "axios";
import User from "./schema/userSchema.js";
import mongoose from "mongoose";

const Bot = () => {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    const Buttons = Markup.keyboard([
        ["®️ Register", "🔥 Select KeyWords", "Your Keywords"],
        ["❌ Delete My Profile", "👥 Share", "📞 Feedback"],
        ["❌ Clear Your Keywords"],
    ]).resize();

    const JobButtons = Markup.keyboard(["Done"]).resize();

    bot.start((ctx) => {
        console.log(ctx.chat);

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

    bot.hears("🔥 Select KeyWords", (ctx) => {
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

    bot.hears("/No", (ctx) => {
        axios
            .patch(`${process.env.BASE_URL}/setFlag/false`, {
                body: ctx.chat.id.toString(),
            })
            .then((response) => {
                console.log(response);
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
                ctx.reply("Done", Buttons);
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
        console.log("here3");
        console.log(ctx.chat.id);
        axios
            .post(`${process.env.BASE_URL}/returnJobFlag`, {
                body: ctx.chat.id.toString(),
            })
            .then((response) => {
                console.log("here4");
                console.log(response);
                if (response.status === 200) {
                    if (response.data?.jobFlag) {
                        console.log("here1");

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
                        // console.log(ctx.channelPost.forward_from_chat)
                        if (ctx.channelPost.reply_markup)
                            var button =
                                ctx.channelPost.reply_markup
                                    .inline_keyboard[0][0];
                        // console.log(uid)
                        //  console.log(ctx.channelPost)
                        // console.log(ctx.channelPost.sender_chat.title)
                        const data = ctx.channelPost?.text;

                        const jTitle = data.substr(0, 9);

                        console.log(data.substr(11).split("\n")[0]);
                        const title = data.substr(11).split("\n")[0];
                        console.log(title.toLowerCase());

                        User.find().then((response) => {
                            console.log(response);
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
                                                ctx.channelPost.text +
                                                    "\n" +
                                                    "To " +
                                                    button?.text +
                                                    " " +
                                                    button?.url
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

export default Bot;
