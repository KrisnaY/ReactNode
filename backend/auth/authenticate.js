export const sessionCheck = (req, res, next) => {
    // console.log('Session:', req.session);
    // console.log('Session user:', req.session.user);
    if(req.session.user){
        return next();
    }else{
        return res.status(401).json({Message : "Silahkan login terlebih dahulu"});
    }
}

export const isAdmin = (role) => {
    return (req, res, next) => {
        if(req.session.user.role !== role){
            res.status(401);
            return res.send("Forbidden")
        }
        next();
    }
}

// module.exports = { sessionCheck, isAdmin };
