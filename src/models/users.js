"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      imgProfile: DataTypes.STRING,
      role: DataTypes.STRING,
      statusId: DataTypes.INTEGER,
      attempt: DataTypes.INTEGER,
      imgBanner: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "users",
    }
  );
  users.associate = (models) => {
    // models.status hrus begitu biarpun nama tabel barunya statuses krena nama modelnya status, ikutin nama modelnya
    // one user can only have one status
    users.belongsTo(models.status, { foreignKey: "statusId" });
    // one user can have many posts
    users.hasMany(models.feed, { foreignKey: "userId" });
    // user can have many posts, posts can have many user like it, through like model
    users.belongsToMany(models.feed, {
      through: models.like,
    });
  };
  return users;
};
