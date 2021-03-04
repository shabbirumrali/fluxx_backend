'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ArtistDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      csv_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      artist: {
        allowNull: true,
        type: Sequelize.STRING
      },
      artist_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      store: {
        allowNull: true,
        type: Sequelize.STRING
      },
      title: {
        allowNull: true,
        type: Sequelize.STRING
      },
      isrc: {
        allowNull: true,
        type: Sequelize.STRING
      },
      upc: {
        allowNull: true,
        type: Sequelize.STRING
      },
      quantity: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      team_percentage: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      type: {
        allowNull: true,
        type: Sequelize.STRING
      },
      customer_paid: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      customer_currency: {
        allowNull: true,
        type: Sequelize.STRING
      },
      country_of_sale: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      songwriter_royalties: {
        allowNull: true,
        type: Sequelize.STRING
      },
      earnings: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      sale_month: {
        allowNull: true,
        type: Sequelize.STRING
      },
      sale_year: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
       
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
        
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ArtistDetails');
  }
};