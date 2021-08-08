module.exports = (req, res, next) => {
    res.locals.layout = "admin/layouts/layout";
    res.locals.toastMessage = req.session.toastMessage ? req.session.toastMessage : null;
    req.session.toastMessage = null;
    next();
};