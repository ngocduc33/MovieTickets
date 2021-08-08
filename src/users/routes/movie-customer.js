const { request, response } = require("express");
const User = require('../../models/user');
var router = require("express").Router();

router.use((request, response, next) => {
  response.locals.layout = "users/layouts/layout";
  next();
});

router.get("/movie-customer-profile", (req, res) => {
  if(req.session.user_id){
    res.render("users/movie-customer");
  }
  else{
    res.redirect("/user/sign-in");
  }
});

router.get("/edit-info", (req, res)=>{
  if(req.session.user_id){
    res.render("users/edit-info");
  }
  else{
    res.redirect("user/sign-in");
  }
});

module.exports = router;
