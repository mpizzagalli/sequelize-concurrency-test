module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('flows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id'
        }
      },
      delta: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      old_balance: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_balance: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('flows');
  }
};
