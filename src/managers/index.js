module.exports = function(wagner) {
  wagner.factory('UserManager', function() {
    var UserManager = require('./UserManager');
    return new UserManager(wagner);
  }); 
   wagner.factory('AuthManager', function() {
    var AuthManager = require('./AuthManager');
    return new AuthManager(wagner);
  });
}

