const { db } = require("../config/config.json");

const model = require("../models");
const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const { createToken } = require("../helper/jwt");
const transporter = require("../helper/nodemailer");
const hbs = require("nodemailer-express-handlebars");

let salt = bcrypt.genSaltSync(10);

module.exports = {
  register: async (req, res, next) => {
    try {
      let getdata = await model.users.findAll({
        where: {
          [sequelize.Op.or]: [
            { email: req.body.email },
            { username: req.body.username },
          ],
        },
      });

      console.log("isi getdata: ", getdata);
      console.log("panjang getdata: ", getdata.length);

      if (getdata.length > 0) {
        res.status(400).send({
          success: false,
          message:
            "email or username already exists, tolong msukkan email / username lain",
        });
      } else {
        // reassign req.body.password content with salt
        req.body.password = bcrypt.hashSync(req.body.password, salt);
        console.log("check data after hash password: ", req.body);

        // stelah lewat proteksi tambah data di database
        let add = await model.users.create(req.body);

        let { username } = add.dataValues;

        let token = createToken(
          {
            id: add.dataValues.id,
            email: add.dataValues.email,
          },
          "200h"
        );

        transporter.use(
          "compile",
          hbs({
            viewEngine: {
              extName: ".html",
              layoutsDir: "./src/helper",
              defaultLayout: "verifytemplate.html",
              partialsDir: "./src/helper",
            },
            viewPath: "./src/helper",
            extName: ".html",
          })
        );

        // Mengirim email verifikasi
        await transporter.sendMail({
          from: "Tracker admin",
          to: req.body.email,
          subject: "Account verification email",
          template: "verifytemplate",
          context: {
            link: `http://localhost:3000/verification/${token}`,
            username: username,
          },
        });

        res.status(201).send({ success: true, data: add });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      // 1. Mencocokkan data email dan password dari request ke database
      console.log("Data dari req :", req.body);

      let get = await model.users.findAll({
        where: sequelize.or({ email: req.body.email }),
        // model: model mana yg mau diambil,dan attributes:  kolom yg mau diambil, ini ada krena kita mau join table lain yg isinya status
        include: [{ model: model.status, attributes: ["status"] }],
      });

      if (get.length > 0) {
        console.log("Check result get :", get[0].dataValues);
        // Pencocokan password
        let check = bcrypt.compareSync(
          req.body.password,
          get[0].dataValues.password
        );
        console.log("status check", check);
        if (check) {
          // reset attempts statusId 1 = unverified
          await model.users.update(
            { attempt: 0, statusId: "1" },
            {
              where: {
                id: get[0].dataValues.id,
              },
            }
          );

          get[0].dataValues.status = get[0].dataValues.status.status;
          console.log("hasil join", get[0].dataValues.status);

          let { id, username, email, imgProfile, role, statusId, imgBanner } =
            get[0].dataValues;
          //Generate token
          let token = createToken({ id, statusId });

          res.status(200).send({
            username,
            email,
            imgProfile,
            role,
            statusId,
            imgBanner,
            token,
          });
        } else {
          // Increment attempt jika attempt < 3
          if (get[0].dataValues.attempt < 3) {
            await model.users.update(
              { attempt: get[0].dataValues.attempt + 1 },
              {
                where: {
                  id: get[0].dataValues.id,
                },
              }
            );
            res.status(400).send({
              success: false,
              message: `Wrong password ${get[0].dataValues.attempt + 1}`,
            });
          } else {
            await model.users.update(
              { statusId: "3" },
              {
                where: {
                  id: get[0].dataValues.id,
                },
              }
            );
            res.status(400).send({
              success: false,
              message: `Your account suspended`,
            });
          }
        }
      } else {
        // 2. Jika data tidak ada, berarti password salah atau belum register
        res.status(404).send({
          success: false,
          message: "Account not found",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  verify: async (req, res, next) => {
    try {
      console.log("read data from token: ", req.decrypt);
      // if token verify keburu expire hrusnya dibawah ada function utk bikin
      // token lagi dlu sbelum update status, ini hrusnya ada di function bru
      // dgn nama re-verfiy
      let updatestatus = await model.users.update(
        { statusId: 2 },
        { where: { id: req.decrypt.id } }
      );
      res.status(200).send({
        success: true,
        data: updatestatus,
        message: "account is now verified",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  keeplogin: async (req, res, next) => {
    try {
      // console.log("req.decrypt = ", req.decrypt)
      let get = await model.users.findAll({
        where: { id: req.decrypt.id },
        include: [{ model: model.status, attributes: ["status"] }],
      });
      console.log("isi get", get);
      console.log("get datavalues", get[0].dataValues);
      get[0].dataValues.status = get[0].dataValues.status.status;
      console.log("hasil join", get[0].dataValues.status);

      let { id, username, email, role, statusId } = get[0].dataValues;
      //Generate token
      let token = createToken({ id, statusId, role });

      res.status(200).send({
        token,
        message: "login success",
        username,
        email,
      });

      console.log(get);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  forgot: async (req, res, next) => {
    try {
      // 1. get email
      let get = await model.users.findAll({
        where: { email: req.body.email },
      });
      let { id, email, username } = get[0].dataValues;
      console.log(
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        get[0].dataValues.username
      );
      //2. create token
      let token = createToken({ id, email }, "24h");

      transporter.use(
        "compile",
        hbs({
          viewEngine: {
            extName: ".html",
            layoutsDir: "./src/helper",
            defaultLayout: "forgotpass.html",
            partialsDir: "./src/helper",
          },
          viewPath: "./src/helper",
          extName: ".html",
        })
      );

      // Mengirim email forget password
      await transporter.sendMail({
        from: "Tracker admin",
        to: req.body.email,
        subject: "Reset your socio password",
        template: "forgotpass",
        context: {
          link: `http://localhost:3000/reset/${token}`,
          username: username,
        },
      });

      res.status(200).send({
        success: true,
        message: "email sent",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  reset: async (req, res, next) => {
    try {
      req.body.password = bcrypt.hashSync(req.body.password, salt);
      let resetpass = await model.users.update(
        {
          statusId: 2,
          password: req.body.password,
        },
        { where: { id: req.decrypt.id } }
      );

      res.status(200).send({
        success: true,
        data: resetpass,
        message: "password is succesfully reset",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
