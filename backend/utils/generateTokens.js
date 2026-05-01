const jwt = require ('jsonwebtoken');

const generateTokens = (user) =>{
    return jwt.sign({
        id: user.id,
        role: user.role,
        fullname: user.fullname
    },
    process.env.JWT_SECRET,
    {expiresIn: '30min'}
);
}
module.exports = generateTokens;