'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type:Sequelize.STRING,
        allowNull:false
      },
      uuid: {
        type:Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4
      },
      // THE MESSAGE THAT HAS THE REACTION
      messageId:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      // THE USER WHO MADE THE REACTION
      userId:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reactions');
  }
};