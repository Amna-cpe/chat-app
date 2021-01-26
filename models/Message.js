'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Reaction,{as:'reactions'})
      //A MESSAGE HAS MANY REACTIONS

    }
  };
  Message.init({
    content: {
      type:DataTypes.STRING,
      allowNull:false
    },
    uuid: {
      type:DataTypes.UUID,
      allowNull:false,
      defaultValue:DataTypes.UUIDV4
    },
    from: {
      type:DataTypes.STRING,
      allowNull:false
    },
    to:  {
      type:DataTypes.STRING,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName:"messages"
  });
  return Message;
};