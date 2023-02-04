'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Hotel.belongsTo(models.user)
    }
  }
  Hotel.init({
    location: DataTypes.STRING,
    checkIn: DataTypes.DATEONLY,
    checkOut: DataTypes.DATEONLY,
    hotelName: DataTypes.STRING,
    currency: DataTypes.STRING,
    limit: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Hotel',
  });
  return Hotel;
};