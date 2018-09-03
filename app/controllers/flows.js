const models = require('./../models'),
  Account = models.account;

exports.byAccountId = (req, res, next) => {
  const accountId = req.params.accountId;
  return Account.findById(accountId).then(account => {
    return account.getFlows().then(flows => {
      return res.send({ flows });
    });
  });
};
