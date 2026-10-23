# Task: check the local ChakraVue EMR for website features

Paste this whole file into a Claude session running in the ChakraVue EMR
folder on this laptop (for example `claude remote-control` started in that
folder). Read-only: do not change, commit or push anything.

## Why

The company website (repo `ChakraVue-Website-plum`, pull request #1) is
being rewritten to describe the EMR's features to patients, doctors and
hospital owners. A review of the GitHub copy
(`ChakravueAI25/Chakravue-Emr-system-`, last pushed 2026-10-22) and the
Android app repo (`ChakravueAI25/chakravue_app`) could not find some
features the website currently claims. This laptop may have newer or
unpushed work. The website must only claim what really exists.

## Step 1: Is this folder ahead of GitHub?

1. Run `git status`, `git branch -a`, `git log --oneline -15`, `git remote -v`.
2. Report any uncommitted files, unpushed commits, or branches not on
   GitHub. Report other EMR copies or folders on this laptop (frontend,
   backend, kiosk, display or app projects) if you spot them nearby. Only
   list them; don't open unrelated personal folders.

## Step 2: Check these features one by one

For each, answer **LIVE** (wired into the app and backend, usable today),
**PARTIAL** (exists but demo, optional, switched off or incomplete),
**PLANNED** (only in documents or TODOs), or **NOT FOUND**. Give the file
paths as evidence, and say whether the code is also on GitHub.

| # | Feature | Notes from the GitHub review |
|---|---|---|
| 1 | Patient self check-in kiosk at reception | Not found; the only "kiosk" was the optical store |
| 2 | Waiting-room TV / token display that calls patients by name | Not found |
| 3 | Video consultation / video follow-up | Demo only in the EMR; the app README says "planned" |
| 4 | Paying bills by UPI from the phone or a payment gateway | App pays only the registration fee by UPI; bills are recorded at the counter (Cash / Card / UPI) |
| 5 | Two-factor login for staff (OTP or authenticator) | Not found; "twofactor.py" is only an SMS sender |
| 6 | Face match / face recognition with patient consent | Not found |
| 7 | Encrypted, automatic backups | Only a manual runbook |
| 8 | AI that flags what changed since the last visit | AI summary needs an optional separate server |
| 9 | SMS or WhatsApp reminders to patients | SMS sender exists, off unless configured; no WhatsApp |
| 10 | Wrong-patient guard (checks the right patient before exam or surgery) | OT time-out and site marking found; confirm a patient-identity check |
| 11 | "NABH-style registers" filled from daily work | SOP compliance engine found; confirm what is live |
| 12 | Free tier for small clinics and optical stores | Not a code feature; say if any licence or plan logic exists |
| 13 | Anything in the "ChakraVue Box" (on-site AI computer, device keys/adapters) | Describe what is built and what is live |

## Step 3: Unique features

List the 10 most distinctive features that a typical Indian hospital EMR
does not have, one plain-English line each, marked LIVE / PARTIAL /
PLANNED. Include anything found here that isn't on GitHub.

## Rules for the report

The report goes onto a public website after review, so:

- **No** patient names, phone numbers, registration IDs, sample filled forms.
- **No** passwords, API keys, server addresses, internal paths.
- **No** device brand or model names, chip/board/GPU names, AI model names.
- **No** insurer, TPA, bank, payment-provider or social-platform names.

Describe these generically ("the autorefractor", "an AI model", "an
insurer"). Never claim NABH accreditation, ABDM, or certification.

## Output

Save the report as `EMR_FEATURE_CHECK_REPORT.md` somewhere easy to find
(for example the Desktop, not inside the EMR repo), and show it in chat.
Keep it under about 1,000 words. The owner will paste it back into the
website session.
