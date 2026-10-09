# Y-TRAK

Web-based timesheet & payroll system for the Yalobusha County Sheriff's Department.
Replaces paper monthly timecards: employees submit timesheets, supervisors validate
and give final approval, and payroll views and prints approved sheets.

## Access

Access is PIN-based — there are no user accounts or passwords. Each role enters a PIN
that routes to its portal. (PINs are not documented in this public repository.)

- **Employee portal** — `index.html`: fill out and submit a monthly timesheet; recall a
  prior month to edit and resubmit.
- **Staff portal** — `validate.html` → `review.html`: review submitted timesheets,
  validate them, give final approval (with signature), or return them to the employee.
- **Payroll portal** — `payroll.html`: view and print approved timesheets (single or bulk).

## Tech stack

- **Netlify** — hosting + serverless functions; auto-deploys from this repo's `main` branch.
- **Supabase** — Postgres database + REST API.
- **Front end** — vanilla HTML/CSS/JS, one self-contained file per page; jsPDF for PDFs.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Employee timesheet entry, recall, and submit |
| `validate.html` | Staff portal — submitted/pending overview, pay-period due date |
| `review.html` | Individual timesheet — validate / approve / return / print |
| `payroll.html` | Approved timesheets — single and bulk print |
| `supervisor.html` | PIN login and routing |
| `maintenance.html` | Maintenance splash page |
| `netlify/functions/submit-timesheet.js` | Inserts a submitted timesheet |
| `netlify/functions/approve-timesheet.js` | Records final approval |
| `netlify.toml` | Netlify build and functions configuration |

## Database (Supabase — `public` schema)

- `timesheets` — one row per submitted timesheet
- `supervisors` — supervisor directory
- `settings` — single global row holding the pay-period due date

## Deployment

Commits to `main` auto-deploy to Netlify (about 30 seconds). Edit files in the GitHub
web editor and commit, or push normally.

## Important — Row Level Security (RLS)

RLS is **intentionally disabled** on all tables. Y-TRAK does not use Supabase Auth; it
uses PIN-based access. Enabling RLS with no policies silently blocks all reads and writes
and will take the system down. If Supabase sends an alert recommending you enable RLS,
dismiss it — do not enable it.

## Keepalive

Supabase's free tier pauses a project after about 7 days of inactivity. An external uptime
monitor pings a REST endpoint on a schedule to keep the project awake.
