const { check, result, validationResult } = require("express-validator");

module.exports = {
  checkUser: async (req, res, next) => {
    try {
      // buat cari tau user lagi pakai routing yg mana,kaya apakah yg regis / login / etc
      console.log("request path = ", req.path);
      if (req.path == "/register") {
        await check("username").notEmpty().isAlphanumeric().run(req);
        await check("email").notEmpty().isEmail().run(req);
      } else if (req.path == "/login") {
        await check("email").optional({ nullable: true }).isEmail().run(req);
      }
      await check("password")
        .notEmpty()
        .isStrongPassword({
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 0,
        })
        .withMessage(
          "your password is too short or does not meet the minimum requirements"
        )
        .run(req);

      const validation = validationResult(req);
      console.log("validation result: ", validation);
      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: "username or password is wrong",
          error: validation.errors,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
