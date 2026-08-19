function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, status: 'ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e && e.parameter ? e.parameter : {};

    const getValue = (key, fallback = '') => {
      const value = raw[key];
      if (Array.isArray(value)) {
        return value[0] || fallback;
      }
      return value || fallback;
    };

    const fullName = getValue('Full Name', 'Not provided');
    const email = getValue('Email', '').trim();
    const phone = getValue('Phone', 'Not provided');
    const preferredDate = getValue('Preferred Date', 'Not provided');
    const reason = getValue('Reason', 'Not provided');
    const guests = getValue('Guests', 'Not provided');
    const heardAboutUs = getValue('Heard About Us', 'Not provided');
    const message = getValue('Message', 'No message provided');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: false,
          status: 'error',
          message: 'Invalid email.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const emailBody = [
      'Full Name: ' + fullName,
      'Email: ' + email,
      'Phone: ' + phone,
      'Preferred Date: ' + preferredDate,
      'Reason: ' + reason,
      'Guests: ' + guests,
      'Heard About Us: ' + heardAboutUs,
      '',
      'Message:',
      message
    ].join('\n');

    MailApp.sendEmail({
      to: 'ninjasushigrill@gmail.com',
      bcc: '6822524367@tmomail.net',
      replyTo: email,
      subject: 'New message — Ninja Revolving Sushi website',
      body: emailBody
    });

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        status: 'success',
        message: 'Message sent successfully.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        status: 'error',
        message: err && err.message ? err.message : String(err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
