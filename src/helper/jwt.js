const jwt = require("jsonwebtoken");

module.exports = {
  createToken: (payload, expire = "24h") => {
    let token = jwt.sign(payload, "EdoTensei", { expiresIn: expire });
    return token;
  },
  readToken: (req, res, next) => {
    jwt.verify(req.token, "EdoTensei", (error, decrypt) => {
      if (error) {
        console.log("error =", error);
        return res.status(401).send({
          success: false,
          message: "No token provided",
          error: error,
        });
      }

      req.decrypt = decrypt; // menampung hasil penerjemahaan token ke prooperty baru
      next();
    });
  },
};
