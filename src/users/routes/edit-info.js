const { request, response } = require("express");
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const router = require("express").Router();


router.use((request, response, next) => {
    response.locals.layout = "users/layouts/layout";
    next();
});

router.get("/edit-info", (req, res) => {
    const msg = req.query.valid;
    const msgErr = req.query.validErr;
    if(req.session.user_id){
        res.render("users/edit-info", {message: msg, messageErr: msgErr});
    }
    else{
        res.redirect("/user");
    }
  });


router.post("/edit-info", asyncHandler (async( req, res) => {
   const {username, phonenumber, email} = req.body;
   let errors = null;
    if (!username){
        errors = "Tên đăng nhập không được để trống";
    }
    const valphone = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    if(!phonenumber.match(valphone)){
        errors = "Số điện thoại không đúng định dạng";
    }
    if (!phonenumber) {
        errors = "Số điện thoại không được để trống";
    }
    const phone = await User.findOne({where:{ 'user_phone': phonenumber }})
    
    if(phone && phone.user_id!=req.session.user_id){
        errors = "Số điện thoại đã được sử dụng";
    }
    
    if (errors!=null) {
        const string = encodeURIComponent(errors);
        return res.redirect('/user/edit-info/?validErr=' + string);  
    } 
    else{
        const user = await User.findOne({where:{'user_email': email}})
        if(user){
            user.user_name = username;
            user.user_phone = phonenumber;
            user.save();
            console.log("thay đổi thành công");
            res.redirect("/user/movie-customer-profile");
        }
        else
        {
            res.redirect("/user/movie-customer-profile")
        }
    }
}));

module.exports = router;