const { db } = require("../config/config.json");

const model = require("../models");
const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const { createToken } = require("../helper/jwt");
const transporter = require("../helper/nodemailer");
const hbs = require("nodemailer-express-handlebars");

let salt = bcrypt.genSaltSync(10);

module.exports = {
  getalluser: async (req, res, next) => {
    try {
      let get = await model.users.findAll({
        attributes: [
          "username",
          "email",
          "statusId",
          "imgProfile",
          "imgBanner",
        ],
        where: {
          id: { [sequelize.Op.ne]: req.decrypt.id },
        },
        order: sequelize.literal("rand()"),
        limit: parseInt(req.query.limit),
      });

      res.status(200).send({
        data: get,
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  getoneuser: async (req, res, next) => {
    try {
      let get = await model.users.findAll({
        attributes: [
          "username",
          "email",
          "statusId",
          "imgProfile",
          "imgBanner",
        ],
        where: {
          username: req.body.username,
        },
      });
      res.status(200).send({
        data: get,
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  getoneposts: async (req, res, next) => {
    try {
      console.log("hasil req.params", req.params.username);
      let get = await model.feed.findAll({
        attributes: ["id", "posting", "createdAt"],
        where: [
          {
            "$user.username$": req.body.username,
          },
        ],
        include: [
          { model: model.users, attributes: ["username", "imgProfile"] },
          {
            model: model.like,
            attributes: ["isliked", "feedId"],
            include: [{ model: model.users, attributes: ["username"] }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      let newData = get.map((val) => {
        return {
          ...val.dataValues,
          countLike: val.dataValues.likes.filter(
            (value) => value.isliked == true
          ).length,
        };
      });
      res.status(200).send({
        count: newData,
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  getallposts: async (req, res, next) => {
    try {
      let get = await model.feed.findAll({
        attributes: ["id", "posting", "createdAt"],
        include: [
          { model: model.users, attributes: ["username", "imgProfile"] },
          {
            model: model.like,
            attributes: ["isliked", "feedId"],
            include: [{ model: model.users, attributes: ["username"] }],
          },
        ],

        order: [["createdAt", "DESC"]],
      });
      console.log("hasil get aaaaaaaaaaaaaaaaaaaa", get);

      let newData = get.map((val) => {
        return {
          ...val.dataValues,
          countLike: val.dataValues.likes.filter(
            (value) => value.isliked == true
          ).length,
        };
      });

      res.status(200).send({
        count: newData,
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  posttweet: async (req, res, next) => {
    try {
      let get = await model.feed.create({
        userId: req.decrypt.id,
        posting: req.body.posting,
      });
      res.status(200).send({
        data: get,
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  like: async (req, res, next) => {
    try {
      console.log("hasil decrypt", req.decrypt);
      let get = await model.like.findAll({
        where: { userId: req.decrypt.id, feedId: req.body.feedId },
      });
      console.log("hasil get like", get);

      if (get.length == 0) {
        await model.like.create({
          feedId: req.body.feedId,
          userId: req.decrypt.id,
          isliked: true,
        });
        res.status(200).send({
          isliked: true,

          data: get,
        });
      } else {
        await model.like.update(
          {
            isliked: get[0].dataValues.isliked ? false : true,
          },
          {
            where: {
              userId: req.decrypt.id,
              feedId: req.body.feedId,
            },
          }
        );
        res.status(200).send({
          isliked: get[0].dataValues.isliked ? false : true,
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
