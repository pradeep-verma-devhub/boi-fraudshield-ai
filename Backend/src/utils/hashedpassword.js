const bcrypt = require("bcryptjs");

module.exports.generatehashedpassword = async function (password) {
    const hashedpassword = await bcrypt.hash(password, 10)
    return hashedpassword;
}