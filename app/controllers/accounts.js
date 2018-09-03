const models = require('./../models'),
  Flow = models.flow,
  Account = models.account;

const retry = require('retry-as-promised'),
  Sequelize = require('sequelize'),
  asyncRetry = require('async-retry');

exports.index = (req, res, next) => {
  return Account.findAll()
    .then(accounts => {
      console.log('Seding all accounts');
      return res.send({ accounts });
    })
    .catch(e => {
      console.log('Some error with index: ', e);
      return next(e);
    });
};

exports.show = (req, res, next) => {
  return Account.findById(req.params.id)
    .then(account => {
      console.log('Showing account with id: ', account.id);
      return res.send({ account });
    })
    .catch(e => {
      console.log('Some error with show: ', e);
      return next(e);
    });
};

exports.createNewAccount = (req, res, next) => {
  return Account.create({ balance: 0 })
    .then(account => {
      console.log('Create succesfulyy account with id: ', account.id);
      return res.status(201).send({ account });
    })
    .catch(e => {
      console.log('Some error with createNewAccount: ', e);
      return next(e);
    });
};

const _deposit = (id, amount) => {
  return models.sequelize
    .transaction({ isolationLevel: models.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE })
    .then(transaction => {
      return Account.findById(id, { transaction, lock: transaction.LOCK.UPDATE })
        .then(account => {
          const oldBalance = account.balance;
          const newBalance = oldBalance + amount;
          console.log(`Founded account, with balance: ${oldBalance}, newBalance: ${newBalance}`);
          return account.update({ balance: newBalance }, { transaction }).then(updatedAccount => {
            return Flow.create(
              {
                accountId: id,
                newBalance,
                oldBalance,
                delta: amount
              },
              { transaction }
            ).then(() => {
              return transaction.commit().then(() => {
                console.log('Updated account correctly, new Balance: ', updatedAccount.balance);
                return updatedAccount;
              });
            });
          });
        })
        .catch(error => {
          return transaction.rollback().then(() => {
            throw error;
          });
        });
    });
};

exports.deposit = (req, res, next) => {
  const amount = req.body.amount;
  const id = req.params.id;
  asyncRetry(
    bail => {
      return _deposit(id, amount).catch(error => {
        const regex = /(deadlock|rollback|TimeoutError|OptimisticLockError|ConnectionTimedOutError|ConnectionRefusedError|ConnectionError|timed out)/i;
        if (regex.test(error.message) || regex.test(error.toString)) {
          console.log('Error related with transaction or deadlock, going to retry?');
          throw error;
        }
        console.log('Another error, bailing ', error.message, error.toString());
        return bail(error);
      });
    },
    {
      retries: 10,
      minTimeout: 500,
      randomize: true,
      onRetry: (error, i) => {
        console.log('onRetry Function, actual error:', error.message);
        console.log('Retry number: ', i);
      }
    }
  )
    .then(account => {
      res.send({ account });
    })
    .catch(error => {
      res.status(501).send({ error: error.message });
    });
};

// exports.deposit = (req, res, next) => {
//   const amount = req.body.amount;
//   const id = req.params.id;
//   retry(
//     options => {
//       console.log('OPTIONS:', options.current);
//       return deposit(id, amount);
//     },
//     {
//       max: 10,
//       timeout: 10000,
//       match: [
//         Sequelize.ConnectionError,
//         Sequelize.ConnectionRefusedError,
//         Sequelize.ConnectionTimedOutError,
//         Sequelize.OptimisticLockError,
//         Sequelize.TimeoutError,
//         /ROLLBACK TRANSACTION/i,
//         /deadlock/i
//       ]
//     }
//   )
//     .then(account => {
//       res.send({ account });
//     })
//     .catch(error => {
//       res.status(501).send({ error: error.message });
//     });
// };
