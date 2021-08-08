const User = require("../../models/user");
const asyncHandler = require('express-async-handler');

module.exports = asyncHandler (async function auth(req, res, next) {
    const { user_id } = req.session;
    res.locals.currentUser = null;
    if(user_id)
    {
        const user = await User.finUserdById(user_id);
        if(user)
        {
            req.currentUser = user;
            res.locals.currentUser = user;
        }
        next();     
    }  
    else
    {
        next();
    }
});