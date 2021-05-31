'use strict';
var moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  const CategoryProject = sequelize.define('CategoryProject', {  
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
    },
    projectname:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    },   
  }, {
      tableName       : 'categoryProjects',
      paranoid        : false,
      timestamps      : false,      
  });
   CategoryProject.associate = function(models) {     
        CategoryProject.belongsTo(models.Category, {
          foreignKey: 'categoryId',
          targetKey:'id',
        }); 
          
    };
  return CategoryProject;
};
