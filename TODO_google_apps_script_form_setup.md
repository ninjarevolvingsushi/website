# Google Apps Script setup for the restaurant contact form

## Todo 1: Create the Apps Script project
1. Open https://script.google.com
2. Click `New project`
3. Rename it to something like `Ninja Revolving Sushi Contact Form`
4. Delete any default code in the editor

## Todo 2: Paste the form handler script
1. Copy the code from the file `tools/contact-form-webapp.gs` in this project
2. Paste it into the Apps Script editor
3. Save the project with a name
4. Make sure the script uses:
   - `MailApp.sendEmail(...)`
   - recipient: `ninjasushigrill@gmail.com`
   - BCC: `6822524367@tmomail.net`

## Todo 3: Deploy the web app and connect it to the website
1. In Apps Script, click `Deploy` → `New deployment`
2. Choose `Web app`
3. Set:
   - Execute as: `Me`
   - Who has access: `Anyone`
4. Click `Deploy`
5. Copy the generated web app URL
6. Open `index.html`
7. Replace the form action with the copied URL
8. Save and test the site
9. Submit one form entry and confirm:
   - The email reaches `ninjasushigrill@gmail.com`
   - The text message reaches the Mint Mobile number via the gateway

## Final notes
- This is the best free long-term setup.
- It avoids FormSubmit activation problems.
- It keeps the form working reliably for years without a paid plan.
