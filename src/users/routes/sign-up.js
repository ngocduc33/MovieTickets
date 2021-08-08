const { request, response } = require("express");
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const router = require("express").Router();
const crypto = require('crypto');


router.use((request, response, next) => {
  response.locals.layout = "users/layouts/layout";
  next();
});

router.get("/sign-up", (req, res) => {
  const msg = req.query.valid;
  const msgErr = req.query.validErr;
  if(req.session.user_id){
      res.redirect("/user");
    }
  else{
    res.render("users/sign-up", {message: msg, messageErr: msgErr});
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
 
//validation schema

router.post("/sign-up", asyncHandler(async(req, res) => {
    
    const { username, email, phonenumber, password, repassword } = req.body;
    
    let errors = null;
    if (!username){
        errors = "Tên đăng nhập không được để trống";
    }
    if (!email) {
        errors = "Email không được để trống";
    }
    const valphone = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    if(!phonenumber.match(valphone)){
        errors = "Số điện thoại không đúng định dạng";
    }
    if (!phonenumber) {
        errors = "Số điện thoại không được để trống";
    }
    const phone = await User.findOne({where:{ 'user_phone': phonenumber }})
    if(phone){
        errors = "Số điện thoại đã được sử dụng";
    }
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
    const user = await User.findOne({where:{ 'user_email': email }})
    if (user){
        errors = "Email này đã được sử dụng";
    }
    if (errors!=null) {
        const string = encodeURIComponent(errors);
        return res.redirect('/user/sign-up/?validErr=' + string);  
    }
    else {
        const data = await User.create({ 
            user_name: username,
            user_email: email,
            user_phone: phonenumber,
            user_password: bcrypt.hashSync(password, 10),
            user_token: crypto.randomBytes(64).toString('hex'),
            });
        if(data != undefined)
        {
            const msg = {
                to: email,
                from: process.env.EMAIL || 'ltw2nnd@gmail.com',              
                subject: 'Xác thực tài khoản của bạn',
                text: `
                    Xin chào, cám ơn bạn đã đăng ký tài khoản tại Sky cinema
                    Hãy truy cập đường dẫn phí dưới để xác thực tài khoản của bạn.
                    http://${req.headers.host}/user/verify-email?token=${data.user_token}
                `,
                html: `
                    <h1>Xin chào</h1>
                    <p>cám ơn bạn đã đăng ký tài khoản tại Sky cinema</p>
                    <p>Hãy nhấp vào đường link phía dưới để xác thực tài khoản của bạn</p>
                    <a href="http://${req.headers.host}/user/verify-email?token=${data.user_token}">Verify your account</a>
                `
            };
            try{
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
                const string = encodeURIComponent('Cám ơn đã đăng ký, xin kiểm tra email của bạn để xác thực tài khoản');
                return res.redirect('/user/sign-up/?valid=' + string);
            }
            catch(error){
                console.log(error);                
                res.redirect("/user");
            } 
        }
        else{
            res.redirect("/user/sign-up");
        }
    }
}));

router.get("/verify-email", async(req, res) => {
    try{
        const user = await User.findOne({where:{'user_token': req.query.token} });
        
        if(!user)
        {
            return res.redirect("/user/sign-up");
        }
        // const userFind = await User.findAll();
        // const u = userFind[0];
        user.user_verify = true;
        user.save();
        const string = encodeURIComponent('Xác thực tài khoản thành công');
        res.redirect("/user/sign-in/?valid=" + string);
    }
    catch(error)
    {
        console.log(error);
        res.redirect("/user");
    }
});

module.exports = router;
