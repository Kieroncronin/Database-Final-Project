const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/', (req, res) => {
  const id = req.body.id;
  const role = req.body.role;

  if (role === 'student') {
    res.redirect('/student?id=' + id);
  } else if (role === 'faculty') {
    res.redirect('/faculty?id=' + id);
  } else if (role === 'registrar') {
    res.redirect('/registrar?id=' + id);
  } else {
    res.redirect('/');
  }
});

module.exports = router;
