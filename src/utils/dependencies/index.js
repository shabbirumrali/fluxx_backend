module.exports = function(wagner) {
  wagner.factory('MailHelper', function() {
    var MailHelper = require('./MailHelper');
    return new MailHelper(wagner);
  });
};

