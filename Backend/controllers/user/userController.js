const asyncHandler = require('express-async-handler');
const User = require('../../models/user/User');
const generateTokenJwt = require('../../middlewares/token/generateToken');
const validationId = require('../../utils/validationId');
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto');
const cloudinaryUploadImage = require('../../utils/cloudinary');
const fs = require('fs');


const registerController = asyncHandler(async (req, res) => {
    const exitedUser = await User.findOne({ email: req?.body?.email });
    if (exitedUser) throw new Error("User readly existed");
    try {
        const user = await User.create({
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            password: req?.body?.password
        });
        res.json(user);
    } catch (error) {
        console.log(error)
        res.json(error);
    }
})

const loginController = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req?.body?.email })
    if (user && (await user.checkPassword(req?.body?.password))) {
        let token;
        token = generateTokenJwt(user.id)
        res.json({
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            profilePhoto: user?.profilePhoto,
            isAdmin: user?.isAdmin,
            token: token
        })
    } else {
        res.status(401);
        throw new Error("Invalid login crendentials")
    }
})

const fetchAllUsersController = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users)
    } catch (error) {
        res.json(error)
    }
})

const deleteUsrController = asyncHandler(async (req, res) => {
    const id = req?.params.id
    validationId(id);
    try {
        const user = await User.findByIdAndDelete(id);
        res.json(user);
    } catch (error) {
        res.json(error)
    }
})
const getUserDetailController = asyncHandler(async (req, res) => {
    const id = req?.params.id
    validationId(id);
    try {
        const user = await User.findById(id).populate('posts')
        res.json(user)
    } catch (error) {
        res.json(error)
    }
})

const getUserProfileController = asyncHandler(async (req, res) => {
    const id = req?.params.id
    validationId(id);
    try {
        const user = await User.findById(id).populate('posts')
        res.json(user)
    } catch (error) {
        res.json(error)
    }
})
const updateUserController = asyncHandler(async (req, res) => {
    const _id = req?.params?.id
    validationId(_id);
    try {
        const user = await User.findByIdAndUpdate(_id,
            {
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                email: req?.body?.email,
                bio: req?.body?.bio,
            },
            {
                new: true,
                runValidators: true
            }
        )
        res.json(user)
    } catch (error) {
        res.json(error)
    }
})
const updatePasswordController = asyncHandler(async (req, res) => {

    const { _id } = req?.user?._id
    const { password } = req?.body
    validationId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.json(user);
    }
})

const followingCtrl = asyncHandler(async (req, res) => {

    const followId = req?.body?.followId
    const userId = req?.user?.id
    console.log(followId)
    console.log(userId)
    validationId(followId)
    const flUser = await User.findById(followId)
    const existUser = flUser?.followers.find(userid => userid.toString() === userId.toString())
    if (existUser) {
        throw new Error("You readly followed this user. ")
    }
    else {
        try {
            await User.findByIdAndUpdate(userId,
                {
                    $push: { following: followId }
                }, { new: true });
            await User.findByIdAndUpdate(followId,
                {
                    $push: { followers: userId },
                    isFollowing: true
                }, { new: true })
            res.json("You followed successful")
        } catch (error) {
            res.json({ error: error.message })
        }

    }
})
const unFollowCtrl = asyncHandler(async (req, res) => {
    const unFollowId = req?.body?.unFollowId;
    const userid = req?.user?.id;
    const user = await User.findById(userid);
    const existed = user?.following?.find(userId => userId.toString() === unFollowId.toString());
    if (existed) {
        await User.findByIdAndUpdate(userid,
            {
                $pull: { following: unFollowId }
            }, { new: true });
        await User.findByIdAndUpdate(unFollowId,
            {
                $pull: { followers: userid },
                isFollowing: false
            }, { new: true })
        res.json("You unfollowed successful")
    } else {
        throw new Error("You readly not followed this user")
    }

})
const blockCtrl = asyncHandler(async (req, res) => {
    const blockId = req?.params?.id;
    validationId(blockId)
    const user = await User.findByIdAndUpdate(blockId,
        {
            isBlocked: true
        }, { new: true })
    res.json(user)
})
const unBlockCtrl = asyncHandler(async (req, res) => {
    const unBlockId = req?.params?.id;
    validationId(unBlockId);
    const user = await User.findByIdAndUpdate(unBlockId,
        { isBlocked: false }, { new: true })
    res.json(user)
})
const generateVerifiedTokenCtrl = asyncHandler(async (req, res) => {
    const loginUserId = req?.user?.id;

    try {
        const userFound = await User.findById(loginUserId)
        const verifyToken = userFound.createAccountVerificationToken();

        await userFound.save();
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: 'vanphat16032003asd@gmail.com', // Change to your recipient
            from: '21522448@gm.uit.edu.vn', // Change to your verified sender
            subject: 'Verify account',
            html: `
                <!DOCTYPE html>
                <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">

                <head>
                    <title></title>
                    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            padding: 0;
                        }

                        a[x-apple-data-detectors] {
                            color: inherit !important;
                            text-decoration: inherit !important;
                        }

                        #MessageViewBody a {
                            color: inherit;
                            text-decoration: none;
                        }

                        p {
                            line-height: inherit
                        }

                        .desktop_hide,
                        .desktop_hide table {
                            mso-hide: all;
                            display: none;
                            max-height: 0px;
                            overflow: hidden;
                        }

                        .image_block img+div {
                            display: none;
                        }

                        @media (max-width:660px) {

                            .desktop_hide table.icons-inner,
                            .social_block.desktop_hide .social-table {
                                display: inline-block !important;
                            }

                            .icons-inner {
                                text-align: center;
                            }

                            .icons-inner td {
                                margin: 0 auto;
                            }

                            .image_block img.fullWidth {
                                max-width: 100% !important;
                            }

                            .mobile_hide {
                                display: none;
                            }

                            .row-content {
                                width: 100% !important;
                            }

                            .stack .column {
                                width: 100%;
                                display: block;
                            }

                            .mobile_hide {
                                min-height: 0;
                                max-height: 0;
                                max-width: 0;
                                overflow: hidden;
                                font-size: 0px;
                            }

                            .desktop_hide,
                            .desktop_hide table {
                                display: table !important;
                                max-height: none !important;
                            }
                        }
                    </style>
                </head>

                <body style="background-color: #f8f8f9; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                    <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"
                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f8f8f9;" width="100%">
                        <tbody>
                            <tr>
                                <td>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3"
                                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0"
                                                        class="row-content stack" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000; width: 640px; margin: 0 auto;"
                                                        width="640">
                                                        <tbody>
                                                            <tr>
                                                            <table border="0" cellpadding="0" cellspacing="0"
                                                            class="paragraph_block block-3" role="presentation"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                            width="100%">
                                                            <tr>
                                                                <td class="pad"
                                                                    style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px;">
                                                                    <div
                                                                        style="color:#555555;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:30px;line-height:120%;text-align:center;mso-line-height-alt:36px;">
                                                                        <p style="margin: 0; word-break: break-word;"><span
                                                                                style="color:#2b303a;"><strong>Verify you Account?</strong></span></p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="paragraph_block block-4" role="presentation"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                            width="100%">
                                                            <tr>
                                                                <td class="pad"
                                                                    style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px;">
                                                                    <div
                                                                        style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:15px;line-height:150%;text-align:center;mso-line-height-alt:22.5px;">
                                                                        <p style="margin: 0; word-break: break-word;"><span
                                                                                style="color:#808389;">If you were requested to verify your account, verify now within 10 minutes. Otherwise ignore this message</span></p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="button_block block-5" role="presentation"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                            width="100%">
                                                            <tr>
                                                                <td class="pad"
                                                                    style="padding-left:10px;padding-right:10px;padding-top:15px;text-align:center;">
                                                                    <div align="center" class="alignment">
                                                                        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="www.example.com" style="height:62px;width:209px;v-text-anchor:middle;" arcsize="57%" stroke="false" fillcolor="#f7a50c"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a
                                                                            href="http://localhost:3000/verify-account/${verifyToken}"
                                                                            style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#f7a50c;border-radius:35px;width:auto;border-top:0px solid transparent;font-weight:undefined;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:15px;padding-bottom:15px;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;"
                                                                            target="_blank"><span
                                                                                style="padding-left:30px;padding-right:30px;font-size:16px;display:inline-block;letter-spacing:normal;"><span
                                                                                    style="margin: 0; word-break: break-word; line-height: 32px;"><strong>VERIFY ACCOUNT</strong></span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table><!-- End -->
                </body>

                </html>
                `,

        }
        sgMail
            .send(msg)
            .then(() => {

                res.json(verifyToken)
            })
            .catch((error) => {

                res.json('fail')
            })
    }
    catch (err) {
        res.json("error: " + err.message)
    }
});

const updateVerifyAccountCtrl = asyncHandler(async (req, res) => {
    const token = req?.body?.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const userFound = await User.findOne({
        accountVerificationToken: hashedToken,
        accountVerificationTokenExpires: { $gt: new Date() }
    })
    if (!userFound) {
        throw new Error("Token expires, try again later")
    } else {
        userFound.accountVerificationToken = undefined;
        userFound.accountVerificationTokenExpires = undefined;
        userFound.isAccountVerified = true;
        await userFound.save();
        res.json(userFound)
    }
})

const generateResetTokenCrtl = asyncHandler(async (req, res) => {
    const email = req?.body?.email;
    const userFound = await User.findOne({email:email});
    try {
        const verifyToken = await userFound.createResetPassToken();
        await userFound.save();
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: 'vanphat16032003asd@gmail.com', // Change to your recipient
            from: '21522448@gm.uit.edu.vn', // Change to your verified sender
            subject: 'Reset password',
            html: `
                <!DOCTYPE html>
                <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">

                <head>
                    <title></title>
                    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            padding: 0;
                        }

                        a[x-apple-data-detectors] {
                            color: inherit !important;
                            text-decoration: inherit !important;
                        }

                        #MessageViewBody a {
                            color: inherit;
                            text-decoration: none;
                        }

                        p {
                            line-height: inherit
                        }

                        .desktop_hide,
                        .desktop_hide table {
                            mso-hide: all;
                            display: none;
                            max-height: 0px;
                            overflow: hidden;
                        }

                        .image_block img+div {
                            display: none;
                        }

                        @media (max-width:660px) {

                            .desktop_hide table.icons-inner,
                            .social_block.desktop_hide .social-table {
                                display: inline-block !important;
                            }

                            .icons-inner {
                                text-align: center;
                            }

                            .icons-inner td {
                                margin: 0 auto;
                            }

                            .image_block img.fullWidth {
                                max-width: 100% !important;
                            }

                            .mobile_hide {
                                display: none;
                            }

                            .row-content {
                                width: 100% !important;
                            }

                            .stack .column {
                                width: 100%;
                                display: block;
                            }

                            .mobile_hide {
                                min-height: 0;
                                max-height: 0;
                                max-width: 0;
                                overflow: hidden;
                                font-size: 0px;
                            }

                            .desktop_hide,
                            .desktop_hide table {
                                display: table !important;
                                max-height: none !important;
                            }
                        }
                    </style>
                </head>

                <body style="background-color: #f8f8f9; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                    <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"
                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f8f8f9;" width="100%">
                        <tbody>
                            <tr>
                                <td>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3"
                                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0"
                                                        class="row-content stack" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000; width: 640px; margin: 0 auto;"
                                                        width="640">
                                                        <tbody>
                                                            <tr>
                                                            <table border="0" cellpadding="0" cellspacing="0"
                                                            class="paragraph_block block-3" role="presentation"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                            width="100%">
                                                            <tr>
                                                                <td class="pad"
                                                                    style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px;">
                                                                    <div
                                                                        style="color:#555555;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:30px;line-height:120%;text-align:center;mso-line-height-alt:36px;">
                                                                        <p style="margin: 0; word-break: break-word;"><span
                                                                                style="color:#2b303a;"><strong>Reset password?</strong></span></p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="paragraph_block block-4" role="presentation"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                            width="100%">
                                                            <tr>
                                                                <td class="pad"
                                                                    style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px;">
                                                                    <div
                                                                        style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:15px;line-height:150%;text-align:center;mso-line-height-alt:22.5px;">
                                                                        <p style="margin: 0; word-break: break-word;"><span
                                                                                style="color:#808389;">If you were requested to reset your password, verify now within 10 minutes. Otherwise ignore this message</span></p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            class="button_block block-5" role="presentation"
                                                            style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                            width="100%">
                                                            <tr>
                                                                <td class="pad"
                                                                    style="padding-left:10px;padding-right:10px;padding-top:15px;text-align:center;">
                                                                    <div align="center" class="alignment">
                                                                        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="www.example.com" style="height:62px;width:209px;v-text-anchor:middle;" arcsize="57%" stroke="false" fillcolor="#f7a50c"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a
                                                                            href="http://localhost:3000/reset-password/${verifyToken}"
                                                                            style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#f7a50c;border-radius:35px;width:auto;border-top:0px solid transparent;font-weight:undefined;border-right:0px solid transparent;border-bottom:0px solid transparent;border-left:0px solid transparent;padding-top:15px;padding-bottom:15px;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;"
                                                                            target="_blank"><span
                                                                                style="padding-left:30px;padding-right:30px;font-size:16px;display:inline-block;letter-spacing:normal;"><span
                                                                                    style="margin: 0; word-break: break-word; line-height: 32px;"><strong>RESET PASSWORD</strong></span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table><!-- End -->
                </body>

                </html>
                `
        }
        sgMail.send(msg)
            .then(() => {
                res.json(verifyToken)
            })
            .catch((error) => {
                res.json('send email fail')
            })
    } catch (error) {
        res.json({ error: error.message })
    }
})


const resetPasswordCtrl = asyncHandler(async(req, res)=>{
    const password= req?.body?.password;
    const token = req?.body?.token;
    const hashedToken =  crypto.createHash('sha256').update(token).digest('hex');
    const userFound = await User.findOne({
        passwordResetToken: hashedToken, 
        passwordResetExpires:{$gt: new Date()}
    })
    if(!userFound) throw new Error("Token is expired, try again later!")
    userFound.password = password;
    userFound.passwordResetExpires=undefined;
    userFound.passwordResetToken=undefined
    await userFound.save();
    res.json(userFound)
})

const profilePhotoUploadCtrl = asyncHandler(async(req, res)=>{
    const localPath = `public/images/profile/${req.file.filename}`;
    const imgUpload = await cloudinaryUploadImage(localPath)

    const userId = req?.user.id
    const user = await User.findByIdAndUpdate(userId,{
        profilePhoto:imgUpload.url
    },{new:true})

    fs.unlinkSync(localPath)
    res.json(imgUpload)
})
module.exports = {
    registerController,
    loginController,
    fetchAllUsersController,
    deleteUsrController, 
    getUserDetailController,
    getUserProfileController,
    updateUserController,
    updatePasswordController,
    followingCtrl,
    unFollowCtrl,
    blockCtrl,
    unBlockCtrl,
    generateVerifiedTokenCtrl,
    updateVerifyAccountCtrl,
    generateResetTokenCrtl,
    resetPasswordCtrl,
    profilePhotoUploadCtrl
}