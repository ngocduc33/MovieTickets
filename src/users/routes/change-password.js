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
  
router.get("/change-password", (req, res) => {
    const msg = req.query.valid;
    const msgErr = req.query.validErr;
    if(req.session.user_id){
        res.render("users/change-password", {message: msg, messageErr: msgErr});
        
      }
    else{
        res.redirect("/user");
    }
  });

router.post("/change-password", asyncHandler(async (req, res)=>{
    const { oldpassword, newpassword, repassword } = req.body;
    let errors = null;
    const user = await User.findOne({where: {"user_id": req.session.user_id}});
    if(user && !bcrypt.compareSync(oldpassword, user.user_password)){
      errors = "Mật khẩu cũ không đúng";
    }
    if(newpassword.length<6){
      errors = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }
    if (!newpassword) {
      errors = "Mật khẩu không được để trống";
    }
    if (!repassword) {
      errors = "Mật khẩu xác nhận không được để trống";
    }
    if (newpassword != repassword) {
      errors = "Mật khẩu và mật khẩu xác nhận không khớp";
    }
    if (errors!=null) {
      const string = encodeURIComponent(errors);
      return res.redirect('/user/change-password/?validErr=' + string);  
    }
    else{
      user.user_password = bcrypt.hashSync(newpassword, 10);
      user.save();
      const string = encodeURIComponent('Thay đổi mật khẩu thành công');
      res.redirect('/user/movie-customer-profile?valid=' + string);
      
    }

}));
module.exports = router;