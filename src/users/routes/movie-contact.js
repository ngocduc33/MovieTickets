const { request, response } = require("express");
var router = require("express").Router();

router.use((request, response, next) => {
  response.locals.layout = "users/layouts/layout";
  next();
});

router.get("/contact", (req, res) => {
  res.render("users/movie-contact");
});

module.exports = router;
