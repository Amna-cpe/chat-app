'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //ONE TO MANY (A USER CAN HAVE MANY REACTIONS) BUT (REACTION ONLY BELONG TO ONE USER)
      this.belongsTo(models.Message, {foreignKey:'messageId'})
      this.belongsTo(models.User , {foreignKey:'userId'})
    }
  };
  Reaction.init({
    content: {
      type:DataTypes.STRING,
      allowNull:false
    },
    uuid: {
      type:DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4
    },
    // THE MESSAGE THAT HAS THE REACTION
    messageId:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    // THE USER WHO MADE THE REACTION
    userId:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
  }, 
  {
    sequelize,
    modelName: 'Reaction',
    tableName:'reactions',
  });
  return Reaction;
};