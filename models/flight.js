'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Flight.belongsTo(models.user)
    }
  }
  Flight.init({
    currency: DataTypes.STRING,
    origin: DataTypes.STRING,
    destination: DataTypes.STRING,
    departureAt: DataTypes.DATE,
    returnAt: DataTypes.DATE,
    direct: DataTypes.BOOLEAN,
    sorting: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Flight',
  });
  return Flight;
};