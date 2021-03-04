'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity. */

      
      return queryInterface.bulkInsert('Users', [{
        first_name : 'John',
        last_name : 'Doe',
        username: 'jhondoe',
        email : 'john@heavytechsound.com',
        phone : '465335741',
        password : '$2b$12$EqYtuCgHIdgPIQ5fnhnZ3OsKjF5PF69PQ62KJectsecGip2vlqg5u',
        role : 'manager'
      }], {});
    
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
