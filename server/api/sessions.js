const sessions = require('express').Router();
const { Session, User } = require('../db').models;

sessions.get('/', (req, res, next) => {
  Session.findSession(req.session.id)
    .then(session => {
      if (!session) return res.sendStatus(401);
      res.send(session.data);
    })
    .catch(next)
});

sessions.put('/', (req, res, next) => {
  const { email, password } = req.body
  User.findOne({ where: { email, password }, include: [ Session ]})
    .then(user => {
      if (user) {
        // data to store
        req.session.data = {
          userId: user.id,
          name: user.name,
          email: user.email
        }

        const sessionData = user.sessions.find(sess => sess.isActive) || Session.build({ userId: user.id });
        Object.assign(sessionData, { data: req.session.data });

        return sessionData.save()
          .then(session => {
            req.session.id = session.id
            res.sendStatus(202)
          })
      } else next();
    })
    .catch(next);
})

sessions.delete('/', (req, res, next) => {
  return Session.deleteSession(req.session.id)
    .then(() => res.sendStatus(201))
    .catch(next)
});

module.exports = sessions
