'use strict';
var moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {  
    categoryname:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,        
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,        
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
  Category.associate = function(models) {
    // associations can be defined here        
        Category.hasMany(models.CategoryProject, {
          foreignKey: 'categoryId',
        });
  };


  return Category;
};
