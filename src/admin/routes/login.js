const router = require("express").Router();

router.get('/login', (req, res) => {
    res.render("admin/auth/login", {
        layout: "admin/auth/login"
    });
});

module.exports = router;