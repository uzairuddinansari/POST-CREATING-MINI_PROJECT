const jwt = require('jsonwebtoken');

function isLogging(req, res, next) {
    if (!req.cookies || !req.cookies.token) {
        return res.status(401).send("You must be logged in");
    }

    try {
        const data = jwt.verify(req.cookies.token, process.env.USER_SEC);
        req.user = data;
        next();
    } catch (err) {
        return res.status(401).send("Invalid token, please login again");
    }
}

module.exports = isLogging;
