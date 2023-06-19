"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class feed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  feed.init(
    {
      userId: DataTypes.INTEGER,
      posting: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "feed",
    }
  );
  feed.associate = (models) => {
    // one post can only belong to one user
    feed.belongsTo(models.users, { foreignKey: "userId" });
    // one post can have many likes
    feed.hasMany(models.like, { foreignKey: "feedId" });
    // one post can have many likes from different users and one user can have many posts
    feed.belongsToMany(models.users, {
      through: models.like,
      uniqueKey: "my_custom_unique",
    });
  };
  return feed;
};
