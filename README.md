# Database-Final-Project
Final project made for CSC305

You will write a Web front end to Mannino's university database. (I will substitute some or all of the data, but I will not change the structure.) The database will reside in a sqlite file Download sqlite file. Your front end will be written in Node.js, Express, and pug.

Each team will establish a Github repository where all of your files will be stored. I can make space available on cs.converse.edu where you can run your node.js code, but it's probably easier and certainly more flexible to run node.js on your own machines and look at the pages by pointing your browser at localhost.

Behaviors
A user coming to your initial page should be able to enter his or her ID number, and choose one of three roles:

Student
Faculty, or
Registrar
The user should then be redirected to the appropriate page for that role.

Student
If the user has chosen the student role, he or she should be taken to a page that does two things:

Shows the courses in which the student has already enrolled (from all terms)
Shows the courses offered in the upcoming term (Winter 2025), with a way for the student to enroll in and drop those courses
For courses in which the student has already enrolled, your page should show:

Course number
Term
Year
Instructor's full name
Grade (if any)
For courses in the upcoming term, your page should show:

Course number
Instructor's full name (which may be blank if there is none in the database)
Location offered
Time offered
Days offered
Whether or not the course is already in the student's schedule
Make sure that any course the student signs up for is in fact a course offered in the upcoming term. Make sure that the student does not have duplicate enrollments in the same offering. Other than that, you need not check the student's schedule for sanity.

When a student enrolls in a course or drops a course, you should redisplay the entire page so you can reflect the change in the list of courses the student is enrolled in.

Faculty
If the user has chosen the faculty role, he or she should be taken to a page that lists the offerings taught by that instructor and allows the instructor to choose one course to edit grades. For each course taught, the page should show:

Course number
Term
Year
If the instructor chooses an offering to edit grades, you should show another page (or at least another table/form), listing the students in that offering. For each student, you should show:

Student full name
Student ID
Student grade in the course (may be blank)
Some means of specifying a new grade
If the instructor submits updated grades, you should make sure that the page reflects the changes.

Registrar
If the user has chosen the registrar role, he or she should be taken to a page that does three things:

Lists the offerings currently scheduled for the upcoming term (Winter 2025),
Allows a new offering to be added, and
Allows a currently-scheduled offering to be canceled
The listing for offerings currently scheduled should show:

Offering number
Course number
Instructor
Location
Time
Days
For any offering currently scheduled, the registrar should be able to change the following:

Instructor
Location
Time
Days
Whether the offering is offered (i.e., cancel the offering)
The registrar should also be able to add a new offering, selecting from a list of courses. For each course in the list of courses, the page should show:

Course number
Course title
Course credit hours
In addition, for any new offering, the registrar should be able to specify the following:

Offering number
Instructor
Location
Time
Days
Whenever an offering is added, deleted, or edited, the list of offerings scheduled for the upcoming term should be updated to show the change.

Part 1 (20 points)
By the due date for this assignment, you should have:

A Github repository for your project code.
Page(s) that allow a user to enter an ID and choose a role.
The user should be taken to a page specific to the role chosen.
The page should display the ID number the user entered.
In the blank below, submit the URL of your project repository on Github.

Part 2 (20 points)
By the due date for this assignment, your code should:

Display the current information for the student, faculty, and registrar roles.
For students and faculty, the data displayed must depend on the ID number entered.
You don't need to make any changes to the data (yet).
You do not need to submit anything on Canvas for this part.  I will get your work from Github.

Part 3 (20 points)
By the due date for this assignment, your code should:

Let a student add and drop a course correctly.
You do not need to submit anything on Canvas for this part.  I will get your work from Github.

Part 4 (30 points)
By the end of classes, your project must be complete. In particular, you will need to let faculty edit grades and the registrar add/edit/cancel offerings.
