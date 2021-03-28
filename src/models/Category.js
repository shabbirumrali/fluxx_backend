'use strict';
var moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {  
    categoryname:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,        
    },           
    createdAt: {
        type          : DataTypes.DATE,
        allowNull     : true,
        defaultValue  : sequelize.literal('CURRENT_TIMESTAMP')
    },
  }, {
      tableName       : 'categories',
      paranoid        : false,
      timestamps      : false,      
  });

  return Category;
};
