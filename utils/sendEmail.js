const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
})

module.exports = async (email, subject, html) => {
    const options = {
        form: process.env.EMAIL,
        to: email,
        subject,
        html
    }

    transporter.sendMail(options, (err, info) => {
        if(err) {
            console.log(err);
        }
    })
}