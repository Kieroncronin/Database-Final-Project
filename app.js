const express = require("express");
const app = express();
const port = 3000;
const sql3 = require("sqlite3").verbose();

app.set("view engine", "pug");
app.use(express.urlencoded({ extended: true }));

const db = new sql3.Database("./univdb.sqli");

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/student", (req, res) => {
    const id = req.query.id;
    if (!id) return res.send("Missing student ID.");

    db.get("SELECT * FROM Student WHERE StdSSN = ?", [id], (err, studentRow) => {
        if (err) return res.send(err.message);
        if (!studentRow) return res.send("Student not found.");

        const enrolledSql = `
            SELECT o.OfferNo, o.CourseNo, o.OffTerm, o.OffYear,
                   f.FacFirstName || ' ' || f.FacLastName AS Instructor,
                   e.EnrGrade
            FROM Enrollment e
            JOIN Offering o ON e.OfferNo = o.OfferNo
            LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN
            WHERE e.StdSSN = ?
        `;
        db.all(enrolledSql, [id], (err, enrolledRows) => {
            if (err) return res.send(err.message);

            const upcomingSql = `
                SELECT o.OfferNo, o.CourseNo,
                       f.FacFirstName || ' ' || f.FacLastName AS Instructor,
                       o.OffLocation, o.OffTime, o.OffDays
                FROM Offering o
                LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN
                WHERE o.OffTerm = 'WINTER' AND o.OffYear = 2025
            `;
            db.all(upcomingSql, [], (err, upcomingRows) => {
                if (err) return res.send(err.message);
                upcomingRows = upcomingRows || [];

                const enrolledOfferings = new Set(
                    enrolledRows.map(r => r.OfferNo)
                );

                upcomingRows.forEach(o => {
                    o.enrolled = enrolledOfferings.has(o.OfferNo);
                });

                res.render("student", {
                    student: studentRow,
                    enrolled: enrolledRows,
                    offerings: upcomingRows,
                    id
                });
            });
        });
    });
});



app.post("/student/enroll", (req, res) => {
    const { id, offering } = req.body;

    db.get(
        "SELECT 1 FROM Enrollment WHERE StdSSN = ? AND OfferNo = ?",
        [id, offering],
        (err, row) => {
            if (err) return res.send(err.message);
            if (row) return res.redirect(`/student?id=${id}`);

            db.run(
                "INSERT INTO Enrollment (StdSSN, OfferNo) VALUES (?, ?)",
                [id, offering],
                err => {
                    if (err) return res.send(err.message);
                    res.redirect(`/student?id=${id}`);
                }
            );
        }
    );
});

app.post("/student/drop", (req, res) => {
    const { id, offering } = req.body;

    db.get(
        "SELECT EnrGrade FROM Enrollment WHERE StdSSN = ? AND OfferNo = ?",
        [id, offering],
        (err, row) => {
            if (err) return res.send(err.message);
            if (!row) return res.redirect(`/student?id=${id}`);
            if (row.EnrGrade) return res.redirect(`/student?id=${id}`);

            db.run(
                "DELETE FROM Enrollment WHERE StdSSN = ? AND OfferNo = ?",
                [id, offering],
                (err) => {
                    if (err) return res.send(err.message);
                    res.redirect(`/student?id=${id}`);
                }
            );
        }
    );
});

app.post("/display", (req, res) => {
    const { id, role } = req.body;

    if (role === "student") {
        res.redirect(`/student?id=${id}`);
    } else if (role === "faculty") {
        res.redirect(`/faculty?id=${id}`);
    } else if (role === "registrar") {
        res.render('registrar', {id});
    } else {
        res.send("Invalid role.");
    }
});

app.get("/faculty", (req, res) => {
    const id = req.query.id;
    if (!id) return res.send("Missing Faculty ID.");

    db.get("SELECT * FROM Faculty WHERE FacSSN = ?", [id], (err, facultyRow) => {
        if (err) return res.send(err.message);
        if (!facultyRow) return res.send("Faculty not found.");

        const offeringSql = `
            SELECT OfferNo, CourseNo, OffTerm, OffYear
            FROM Offering
            WHERE FacSSN = ?
        `;

        db.all(offeringSql, [id], (err, offerings) => {
            if (err) return res.send(err.message);

            res.render("faculty", {
                faculty: facultyRow,
                offerings
            });
        });
    });
});

app.get("/faculty/offering", (req, res) => {
    const { facid, offerno } = req.query;

    const sql = `
        SELECT s.StdSSN,
               s.StdFirstName || ' ' || s.StdLastName AS FullName,
               e.EnrGrade
        FROM Enrollment e
        JOIN Student s ON e.StdSSN = s.StdSSN
        WHERE e.OfferNo = ?
    `;

    db.all(sql, [offerno], (err, students) => {
        if (err) return res.send(err.message);

        res.render("facultyOffering", {
            facid,
            offerno,
            students
        });
    });
});

app.post("/faculty/update-grades", (req, res) => {
    const { facid, offerno } = req.body;

    const gradeUpdates = Object.keys(req.body)
        .filter(fieldName => fieldName.startsWith("grade_"))
        .map(fieldName => ({
            studentId: fieldName.replace("grade_", ""),
            newGrade: req.body[fieldName]
        }));

    db.serialize(() => {
        gradeUpdates.forEach(update => {
            db.run(
                "UPDATE Enrollment SET EnrGrade = ? WHERE StdSSN = ? AND OfferNo = ?",
                [update.newGrade, update.studentId, offerno]
            );
        });

        res.redirect(`/faculty/offering?facid=${facid}&offerno=${offerno}`);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
