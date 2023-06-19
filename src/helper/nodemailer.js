const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "yellowasian248@gmail.com",
        pass: "gsipowydsmjithne",
    },
});

module.exports = transporter;
