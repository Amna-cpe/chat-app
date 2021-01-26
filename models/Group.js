'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.User,{through:'User_Group'})
    }
  };
  group.init({
    groupName:{
      type:DataTypes.STRING,
      allowNull:false
    },
    id:{
      type:DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true
    }
  }, {
    sequelize,
    modelName: 'Group',
    tableName:'groups'
  });
  return group;
};