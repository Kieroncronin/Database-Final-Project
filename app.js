const express = require('express');
const app = express();
const port = 3000

app.set('view engine', 'pug');
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/display', (req, res) => {
    const {id, role} = req.body;
    if (role === 'faculty'){
        res.render('faculty', {id});
    }
    else if (role === 'registrar'){
        res.render('registrar', {id});
    }
    else {
        res.render('student', {id});
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
