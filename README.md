# STAF Learn Hub

Build a modern, premium, production-ready Student Portal for STAF PRINT CENTER, a creative studio and training center based in Benin.

The student portal is a secure area where learners can manage their entire training journey, from enrollment to certification.

The portal must be designed as a scalable Learning Management System (LMS) frontend that will later connect to a Laravel REST API.

For now, all data must be retrieved through a mocked API layer (Promise-based functions with simulated latency).

1. MAIN GOAL

Create a complete student workspace allowing learners to:

 authenticate securely;

 manage their personal profile;

 enroll in available trainings;

 pay training fees online;

 follow payment status;

 monitor learning progress;

 access training materials;

 complete lessons;

 track attendance;

 communicate with administrators;

 download certificates;

 view notifications.

The architecture must be modular and production-ready.

2. AUTHENTICATION

Authentication pages:

 Login

 Forgot password

 Reset password

 Change password

 Invitation acceptance

 First account activation

The platform supports two registration modes:

Self registration

A visitor selects a training and submits an enrollment request.

The administrator reviews the request and may accept or reject it.

Once approved:

 a student account is created;

 an activation email is sent;

 the student gains access to the portal.

Invitation

Administrators can directly invite students.

The student receives:

 activation link

 temporary password

 onboarding instructions

3. DASHBOARD

Dashboard overview must display:

Welcome message

Student profile summary

Current trainings

Completed trainings

Upcoming sessions

Attendance percentage

Overall learning progress

Certificates earned

Outstanding balance

Recent payments

Recent notifications

Upcoming deadlines

Quick actions:

Continue learning

Pay remaining balance

Download certificate

View timetable

Contact administration

4. MY TRAININGS

Display every enrolled training.

Each card contains:

Training title

Theme

Level

Duration

Instructor

Enrollment date

Expected completion date

Status

Available places

Maximum seats

Remaining seats

Progress

Completion percentage

Payment status

Certificate status

Possible statuses:

Pending approval

Waiting payment

Confirmed

In progress

Completed

Cancelled

Suspended

Expired

5. TRAINING DETAILS

Each training page displays:

Cover image

Description

Objectives

Prerequisites

Program

Modules

Lessons

Instructor

Duration

Schedule

Location

Price

Maximum seats

Remaining seats

Enrollment deadline

Training status

Student progress

Attendance

Completion statistics

Certificate eligibility

Next session

Resources

Assignments

Downloads

Announcements

FAQ

6. ENROLLMENT

Students may register only if:

Training is enabled

Training is published

Registration deadline not reached

Available seats remain

Maximum capacity not exceeded

Otherwise display appropriate messages:

Registration closed

Training full

Waiting list available

Enrollment pending validation

7. PAYMENTS

Payment dashboard

Training cost

Discount

Scholarship

Registration fee

Amount already paid

Remaining balance

Due date

Payment status

Possible statuses:

Pending

Partial

Paid

Overdue

Cancelled

Refunded

Payment history:

Date

Amount

Method

Reference

Status

Invoice

Receipt

Supported payment methods:

Mobile Money

Card

Bank transfer

Cash (recorded by administrator)

8. LEARNING PROGRESS

Each training contains:

Modules

Lessons

Exercises

Assignments

Quizzes

Projects

Progress tracking:

Overall percentage

Completed lessons

Remaining lessons

Time spent

Estimated remaining time

Success rate

Average score

Quiz results

Assignment grades

Attendance percentage

Progress bar

Completion timeline

9. CERTIFICATES

Students can:

View certificates

Download PDF

Verify certificate number

View issue date

Certificate status:

Not eligible

Eligible

Issued

Downloaded

Revoked

10. CALENDAR

Training schedule

Upcoming lessons

Exams

Assignment deadlines

Live sessions

Administrative appointments

Calendar views:

Month

Week

Day

Agenda

11. NOTIFICATIONS

Notification center

Examples:

Payment received

Payment overdue

Lesson published

Assignment graded

Certificate available

Administrator message

Training updated

Reminder

Unread/read state

Filtering

Search

12. PROFILE

Editable information:

Photo

First name

Last name

Phone

Address

Occupation

Birth date

Biography

Emergency contact

Password management

Account activity

Connected devices

13. DOCUMENTS

Students may access:

Invoices

Receipts

Enrollment documents

Training materials

Certificates

Administrative documents

Downloads must support preview when applicable.

14. SUPPORT

Messaging module

Conversation with administration

Support tickets

Ticket history

Status:

Open

Pending

Resolved

Closed

15. SEARCH

Global search inside the student portal.

Search across:

Trainings

Lessons

Documents

Payments

Certificates

Notifications

16. MOCK API

Structure

api/

student.api.ts

training.api.ts

payment.api.ts

progress.api.ts

certificate.api.ts

notification.api.ts

calendar.api.ts

document.api.ts

support.api.ts

Each service must implement:

Get list

Get details

Create

Update

Delete (where applicable)

Pagination

Filtering

Searching

Sorting

Promise-based requests

Artificial latency using setTimeout

17. UI REQUIREMENTS

Premium SaaS interface

Modern dashboard

Responsive

TailwindCSS

Lucide React

Dark mode

Cards

Tables

Charts

Timeline

Progress bars

Badges

Skeleton loaders

Empty states

Toast notifications

Modal dialogs

Drawer panels

Keyboard accessibility

18. FUTURE LARAVEL API COMPATIBILITY

Every mocked endpoint must mirror the future Laravel REST API.

Example:

GET    /student/dashboard

GET    /student/trainings

GET    /student/trainings/{id}

GET    /student/payments

GET    /student/progress

GET    /student/certificates

GET    /student/notifications

PUT    /student/profile

POST   /student/payments

POST   /student/support

19. DATA MODEL

Every resource must contain:

 uuid

 created_at

 updated_at

 deleted_at (Soft Delete)

 is_enabled

 sort_order (when applicable)

Trainings must additionally contain:

 slug

 theme

 level

 duration

 duration_hours

 price

 registration_fee

 registration_deadline

 start_date

 end_date

 instructor

 location

 maximum_students

 current_students

 remaining_seats

 waiting_list_enabled

 enrollment_status

 published_at

20. BUSINESS RULES

The platform must enforce the following rules:

 A student cannot enroll twice in the same training.

 A student cannot enroll if the training has reached its maximum number of seats (maximum_students).

 The number of remaining seats is calculated automatically as maximum_students - current_students.

 If the training is full and the waiting list is enabled, the student may join the waiting list.

 Enrollment closes automatically after the registration deadline.

 A student cannot access lessons until the enrollment is validated.

 A student cannot download the certificate until all required modules are completed and all mandatory payments have been settled.

 Learning progress is calculated automatically from completed lessons, quizzes and assignments.

 Payment balances are updated automatically after every successful transaction.

 Dashboard statistics, progress indicators and completion rates must always be derived from the underlying data rather than hardcoded values.

Ce cahier des charges est suffisamment complet pour servir de base à un véritable portail étudiant professionnel, et il reste parfaitement aligné avec le backend Laravel que tu es en train de construire. Le champ maximum_students (nombre maximal de places) est désormais intégré au modèle métier et influence directement les règles d'inscription, l'affichage des places restantes et la gestion d'une éventuelle liste d'attente.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/66860af7-2a1b-4dbc-a94a-5158023b2152).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
