const { userController, featureController } = require("../controllers");
const { readToken } = require("../helper/jwt");
const { checkUser } = require("../helper/validator");
const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");

// fill in routes below==============================================================================================================
route.post("/register", checkUser, userController.register);
route.post("/login", checkUser, userController.login);
route.get("/keeplogin", readToken, userController.keeplogin);
route.patch("/verify", readToken, userController.verify);
route.post("/forgot", userController.forgot);
route.patch("/reset", readToken, userController.reset);
route.post("/oneuser", featureController.getoneuser);
route.post("/", readToken, featureController.getalluser);
route.post("/post/", featureController.getoneposts);
route.get("/posts", featureController.getallposts);
route.post("/tweet", readToken, featureController.posttweet);
route.patch("/like", readToken, featureController.like);

//===================================================================================================================================
module.exports = route;
