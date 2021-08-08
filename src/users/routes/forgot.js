const { request, response } = require("express");
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../../models/user');
const router = require("express").Router();


router.use((request, response, next) => {
    response.locals.layout = "users/layouts/layout";
    next();
  });

  
router.get("/forgot", (req, res) => {
    const msg = req.query.valid;
    const msgErr = req.query.validErr;
    if(req.session.user_id){
        res.redirect("/user");
      }
    else{
        res.render("users/forgot", {message: msg, messageErr: msgErr});
    }
  });
  

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL || 'ltw2nnd@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'erzfrkcjmupomcnt'
    }
});  

router.post("/forgot", asyncHandler(async(req, res)=>{
    const {email} = req.body;
    const user = await User.findUserByEmail(email);
    if (!email) {
        const string = encodeURIComponent('Email không được để trống');
        return res.redirect('/user/forgot/?validErr=' + string);   
    }
    if(!user){
        const string = encodeURIComponent('Email này không tồn tại');
        return res.redirect('/user/forgot/?validErr=' + string);   
    }
    else{
        const code = crypto.randomBytes(64).toString('hex');
            const msg = {
                to: email,
                from: process.env.EMAIL || 'ltw2nnd@gmail.com',              
                subject: 'Đặt lại mật khẩu',
                text: `
                    Xin chào ${user.user_name}, Ai đó vừa yêu cầu thay đổi mật khẩu tài khoản Sky cinema của bạn.
                    Nếu đây là bạn, hãy nhấp vào đường link phía dưới để đặt lại mật khẩu.
                    http://${req.headers.host}/user/reset-password?token=${code}
                `,
                html: `
                    <h1>Yêu cầu đặt lại mật khẩu</h1>
                    <p>Ai đó vừa yêu cầu thay đổi mật khẩu tài khoản Sky cinema của bạn.</p>
                    <p>Nếu đây là bạn, hãy nhấp vào đường link phía dưới để đặt lại mật khẩu.</p>
                    <a href="http://${req.headers.host}/user/reset-password?token=${code}">Đặt lại mật khẩu của bạn</a>
                    <p>Nếu bạn không muốn thay đổi mật khẩu của bạn, hãy đơn giản là bỏ qua email này và mọi thứ không có gì thay đổi.</p>
                `
            };try{
                transporter.sendMail(msg, (error, info) => {
                    if(error)
                    {
                        console.log(error);
                    }
                    else
                    {
                        console.log("email send" + info.response);
                    }
                })
                user.user_codereset = code;
                user.save();
                const string = encodeURIComponent('Xin kiểm tra email của bạn để đặt lại mật khẩu');
                return res.redirect('/user/forgot/?valid=' + string);
            }
            catch(error){
                console.log(error);
                const string = encodeURIComponent('Đã có lỗi sảy ra');
                res.redirect('/user/forgot/?valid=' + string);
            } 
    }
}));


router.get("/reset-password", asyncHandler(async(req, res) => {
    const msg = req.query.valid;
    const msgErr = req.query.validErr;
    const token= req.query.token;
    const user = await User.findOne({where:{'user_codereset': token} });
    
    if(req.session.user_id){
        res.redirect("/user");
    }
    if(!user){
        const string = "Mã đặt lại mật khẩu không tồn tại";
        res.redirect('/user/sign-in?validErr=' + string);
    }
    else{
        res.render("users/reset-password", {message: msg, messageErr: msgErr, token: token});
    }
}));


router.post("/reset-password", asyncHandler(async(req, res) =>{
    const { password, repassword, token } = req.body;
    console.log(req.body);
    console.log(token);
    const user = await User.findOne({where:{'user_codereset': token} });
    
    let errors = null;
    if(password.length<6){
        errors = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!password) {
        errors = "Mật khẩu không được để trống";
    }
    if (!repassword) {
        errors = "Mật khẩu xác nhận không được để trống";
    }
    if (password != repassword) {
        errors = "Mật khẩu và mật khẩu xác nhận không khớp";
    }
    if (errors!=null) {
        const string = encodeURIComponent(errors);
        return res.redirect('/user/reset-password/?token='+token+'&validErr='+string);  
    }
    
    if(!user)
    {
        return res.redirect("/user/sign-up");
    }
    else{
        try{
        
            user.user_password = bcrypt.hashSync(password, 10);
            user.user_codereset = null;
            user.save();
            const string = encodeURIComponent('Mật khẩu của bạn đã được thay đổi thành công');
            res.redirect("/user/sign-in/?valid=" + string);
        }
        catch(error){
            console.log(error);
            res.redirect("/user");
        }
    }
}));

module.exports = router;
