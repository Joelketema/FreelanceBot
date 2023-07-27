const User = require("../schema/userSchema.js");

function authController(req, res) {
    console.log(req.body.body);
    User.findOne({ username: req.body.body })
        .then((response) => {
            if (response === null) {
                new User({
                    username: req.body.body,
                    name: req.body.name,
                    score: Number(0),
                    rank: Number(0),
                })
                    .save()
                    .then((response) => {
                        res.send("Successfully Registered! ✅");
                    })
                    .catch((e) => {
                        res.send("an Error Occured Please Try Again❗");
                        console.log(e);
                    });
            } else res.send("You are Already Registered❗");
        })
        .catch((e) => {
            console.log(e);
        });
    // res.send("registered" + req.body.body)
}

module.exports = authController;
