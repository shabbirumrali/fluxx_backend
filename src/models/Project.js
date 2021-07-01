'use strict';
var moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {  
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,        
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,        
    }, 
    project_manager:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    },
    project_sponsor:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    },
    project_need:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    },
     goal:{
        type: DataTypes.JSON,
        allowNull: true,
        unique: false
            
    },
     benefits:{
        type: DataTypes.JSON,
        allowNull: true,
        unique: false, 
        
    },
     InScope:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    },
     outScope:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    },
     startDate:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,        
    },
     finishDate:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,        
    },
     budget:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    },
     assumptionTime:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    },
     impact:{
        type: DataTypes.JSON,
        allowNull: true,
        unique: false,        
    },
     stakeholder:{
        type: DataTypes.JSON,
        allowNull: true,
        unique: false, 
       
    },
     risks:{
        type: DataTypes.JSON,
        allowNull: true,
        unique: false,
             
    },
     step:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,        
    }, 
    step:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,        
    },            
    created_at: {
        type          : DataTypes.DATE,
        allowNull     : true,
        defaultValue  : sequelize.literal('CURRENT_TIMESTAMP')
    },
  }, {
      tableName       : 'projects',
      paranoid        : false,
      timestamps      : false,      
  });

  return Project;
};
