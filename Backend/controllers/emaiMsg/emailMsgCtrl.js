const expressAsyncHandler = require('express-async-handler')
const EmailMsg = require('../../models/emailMessaging/emailMessaging')
const sgMail = require('@sendgrid/mail');
const { badWords } = require('vn-badwords');
const BadWordsFilter = require('bad-words');

const createEmailMsg = expressAsyncHandler(async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        const text = subject + " " + message
        const filter = new BadWordsFilter();
        const isProfaneE = filter.isProfane(text)
        const isProfaneVN = badWords(text, { validate: true })
        if (isProfaneE || isProfaneVN) {
            res.json({ message: "Not sent email because it contains profane word" })
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to,
            subject,
            from: "21522448@gm.uit.edu.vn",
            text: message
        }
        await sgMail.send(msg)
        await EmailMsg.create({
            fromEmail:req.user.email,
            toEmail: to,
            message,
            subject,
            sendBy:req.user._id
        })
        res.json("email sent")
    } catch (error) {
        res.json(error)
    }
})

module.exports = { createEmailMsg }