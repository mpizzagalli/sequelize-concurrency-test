const accounts = require('./controllers/accounts'),
  flows = require('./controllers/flows');

exports.init = app => {
  app.post('/accounts', accounts.createNewAccount);
  app.get('/accounts', accounts.index);
  app.get('/accounts/:id', accounts.show);
  app.post('/accounts/:id/deposit', accounts.deposit);

  app.get('/accounts/:accountId/flows', flows.byAccountId);
};
