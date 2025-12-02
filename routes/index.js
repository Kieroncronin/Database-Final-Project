const express = require('express');
const router = express.Router();
const db = require('../db');

// Home page
router.get('/', (req, res) => {
  res.render('index');
});

// Handle role selection
router.post('/', (req, res) => {
  const id = req.body.id;
  const role = req.body.role;

  if (role === 'student') {
    res.redirect('/student?id=' + id);
  } else if (role === 'faculty') {
    res.redirect('/faculty?id=' + id);
  } else if (role === 'registrar') {
    res.redirect('/registrar');
  } else {
    res.redirect('/');
  }
});

// Student info
router.get('/student', (req, res) => {
  const studentId = req.query.id;

  db.query('SELECT * FROM Students WHERE student_id = ?', [studentId], (err, studentRows) => {
    if (err) throw err;

    db.query(
      'SELECT c.course_id, c.course_name FROM Courses c JOIN Enrollment e ON c.course_id = e.course_id WHERE e.student_id = ?',
      [studentId],
      (err, courseRows) => {
        if (err) throw err;

        db.query('SELECT * FROM Courses', (err, allCourses) => {
          if (err) throw err;
          res.render('student', {
            student: studentRows[0],
            courses: courseRows,
            allCourses: allCourses
          });
        });
      }
    );
  });
});

// Faculty info
router.get('/faculty', (req, res) => {
  const facultyId = req.query.id;

  db.query('SELECT * FROM Faculty WHERE faculty_id = ?', [facultyId], (err, facultyRows) => {
    if (err) throw err;

    db.query('SELECT * FROM Courses WHERE faculty_id = ?', [facultyId], (err, courseRows) => {
      if (err) throw err;
      res.render('faculty', { faculty: facultyRows[0], courses: courseRows });
    });
  });
});

// Registrar overview
router.get('/registrar', (req, res) => {
  db.query('SELECT * FROM Students', (err, students) => {
    if (err) throw err;
    db.query('SELECT * FROM Faculty', (err, faculty) => {
      if (err) throw err;
      db.query('SELECT * FROM Courses', (err, courses) => {
        if (err) throw err;
        res.render('registrar', { students, faculty, courses });
      });
    });
  });
});

// Add course
router.post('/student/:id/add-course', (req, res) => {
  const studentId = req.params.id;
  const courseId = req.body.course_id;

  db.query('INSERT INTO Enrollment (student_id, course_id) VALUES (?, ?)', [studentId, courseId], (err) => {
    if (err) throw err;
    res.redirect('/student?id=' + studentId);
  });
});

// Drop course
router.post('/student/:id/drop-course', (req, res) => {
  const studentId = req.params.id;
  const courseId = req.body.course_id;

  db.query('DELETE FROM Enrollment WHERE student_id = ? AND course_id = ?', [studentId, courseId], (err) => {
    if (err) throw err;
    res.redirect('/student?id=' + studentId);
  });
});

module.exports = router;
