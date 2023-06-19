"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  like.init(
    {
      userId: DataTypes.INTEGER,
      feedId: DataTypes.INTEGER,
      isliked: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "like",
    }
  );
  like.associate = (models) => {
    // one like belongs to one user
    like.belongsTo(models.users, { foreignKey: "userId" });
    // one like belongs to one post
    like.belongsTo(models.feed, { foreignKey: "feedId" });
  };
  return like;
};
