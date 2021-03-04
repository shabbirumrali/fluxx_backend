module.exports = function(wagner) {
  wagner.factory('UserManager', function() {
    var UserManager = require('./UserManager');
    return new UserManager(wagner);
  }); 
   wagner.factory('AuthManager', function() {
    var AuthManager = require('./AuthManager');
    return new AuthManager(wagner);
  });  
   //  wagner.factory('CsvManager', function() {
  //   var CsvManager = require('./CsvManager');
  //   return new CsvManager(wagner);
  // });
  // wagner.factory('ArtistManager', function() {
  //   var ArtistManager = require('./ArtistManager');
  //   return new ArtistManager(wagner);
  // });
  // wagner.factory('StripeManager', function() {
  //   var StripeManager = require('./StripeManager');
  //   return new StripeManager(wagner);
  // });
  // wagner.factory('WithdrawRequestManager', function() {
  //   var WithdrawRequestManager = require('./WithdrawRequestManager');
  //   return new WithdrawRequestManager(wagner);
  // });
  // wagner.factory('EarningTransactionsManager', function() {
  //   var EarningTransactionsManager = require('./EarningTransactionsManager');
  //   return new EarningTransactionsManager(wagner);
  // });
  // wagner.factory('ArtistSongSplitManager', function() {
  //   var ArtistSongSplitManager = require('./ArtistSongSplitManager');
  //   return new ArtistSongSplitManager(wagner);
  // }); 
  // wagner.factory('StoreManager', function() {
  //   var StoreManager = require('./StoreManager');
  //   return new StoreManager(wagner);
  // }); 
  // wagner.factory('CommonManager', function() {
  //   var CommonManager = require('./CommonManager');
  //   return new CommonManager(wagner);
  // });   
}

