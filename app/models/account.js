module.exports = (sequelize, DataTypes) => {
  const account = sequelize.define(
    'account',
    {
      balance: DataTypes.INTEGER
    },
    {
      underscored: true
    }
  );
  account.associate = function(models) {
    account.hasMany(models.flow);
  };
  return account;
};
