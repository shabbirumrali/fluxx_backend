'use strict';
var moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {  
    categoryId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,        
    },
    projectId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,        
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,        
    }

    
  }, {
      tableName       : 'categoryProjects',
      paranoid        : false,
      timestamps      : false,      
  });

  return Category;
};
