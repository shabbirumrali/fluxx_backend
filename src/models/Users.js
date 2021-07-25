'use strict';
var moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
  
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,        
    },
    profile_image:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },    
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
     },
    status:{
      type: DataTypes.BOOLEAN,
      defaultValue:1
    },
    subscribeUser:{
      type: DataTypes.BOOLEAN,
      defaultValue:1
    },
    reset_token:{
      type: DataTypes.STRING,
      allowNull: true
    },        
    createdAt: {
        type          : DataTypes.DATE,
        allowNull     : true,
        defaultValue  : sequelize.literal('CURRENT_TIMESTAMP')
    },
  }, {
      tableName       : 'users',
      paranoid        : false,
      timestamps      : false,      
  });
//   User.associate = function(models) {
    
//   };
  return User;
};
