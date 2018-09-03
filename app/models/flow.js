module.exports = (sequelize, DataTypes) => {
  const flow = sequelize.define(
    'flow',
    {
      accountId: { type: DataTypes.INTEGER, field: 'account_id' },
      delta: DataTypes.INTEGER,
      oldBalance: { type: DataTypes.INTEGER, field: 'old_balance' },
      newBalance: { type: DataTypes.INTEGER, field: 'new_balance' }
    },
    {
      underscored: true
    }
  );
  flow.associate = function(models) {
    flow.belongsTo(models.account);
  };
  return flow;
};
