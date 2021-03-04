module.exports = function(wagner) {
  wagner.factory('ValidateRequest', function() {
    var ValidateRequest = require('./validate_token');
    return new ValidateRequest(wagner);
  });  
}

