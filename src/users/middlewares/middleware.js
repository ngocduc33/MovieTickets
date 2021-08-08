module.exports = (req, res, next) => {
    res.locals.layout = "users/layouts/layout";
    const {listShowtimes} = req.session;
    
    if(listShowtimes)
    {
        res.locals.listShowTimes = listShowtimes;
        req.session.listShowtimes = null;
        next();
    }
    else
    {
        res.locals.listShowTimes = null;
        req.session.listShowtimes = null;
        res.locals.errors = req.flash('info');
        next();
    }
};