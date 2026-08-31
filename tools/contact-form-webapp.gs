function respondJson(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseRequestBody(e) {
  try {
    if (e && e.parameter && Object.keys(e.parameter).length) {
      return e.parameter;
    }

    if (e && e.postData && e.postData.contents) {
      const raw = e.postData.contents;
      const type = (e.postData && e.postData.type) ? String(e.postData.type).toLowerCase() : '';

      if (type.indexOf('application/json') !== -1 || /^\s*[{\[]/.test(raw || '')) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }

      const parsedQuery = Utilities.parseQueryString(raw || '');
      if (parsedQuery && Object.keys(parsedQuery).length) {
        return parsedQuery;
      }
    }
  } catch (err) {
    // Fall through to an empty object so the request still gets validated below.
  }

  return {};
}

function getValue(data, key, fallback = '') {
  const value = data && Object.prototype.hasOwnProperty.call(data, key) ? data[key] : undefined;
  if (value == null) return fallback;
  if (Array.isArray(value)) {
    return String(value[0] || fallback).trim();
  }
  if (typeof value === 'object') {
    const first = Object.values(value)[0];
    return String(first ?? fallback).trim();
  }
  return String(value).trim() || fallback;
}

function getTwilioConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    accountSid: (props.getProperty('TWILIO_ACCOUNT_SID') || '').trim(),
    authToken: (props.getProperty('TWILIO_AUTH_TOKEN') || '').trim(),
    fromNumber: (props.getProperty('TWILIO_FROM_NUMBER') || '').trim(),
    toNumber: (props.getProperty('TWILIO_TO_NUMBER') || '').trim()
  };
}

function sendSmsAlert(messageText) {
  const cfg = getTwilioConfig();

  if (!cfg.accountSid || !cfg.authToken || !cfg.fromNumber || !cfg.toNumber) {
    return { ok: false, status: 'not_configured', message: 'Twilio is not configured in Script Properties.' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;
  const authHeader = Utilities.base64Encode(`${cfg.accountSid}:${cfg.authToken}`);

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: {
      To: cfg.toNumber,
      From: cfg.fromNumber,
      Body: messageText
    },
    headers: {
      Authorization: `Basic ${authHeader}`
    },
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();
  const text = response.getContentText();

  if (statusCode >= 200 && statusCode < 300) {
    return { ok: true, status: 'sent' };
  }

  return { ok: false, status: 'failed', statusCode, message: text };
}

function getCstParts(dateValue) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(dateValue || new Date());
  const map = {};
  parts.forEach((part) => {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  });

  return {
    year: Number(map.year || 0),
    month: Number(map.month || 0),
    day: Number(map.day || 0),
    hour: Number(map.hour || 0),
    minute: Number(map.minute || 0),
    second: Number(map.second || 0)
  };
}

function ceilToQuarterHour(totalMinutes) {
  return Math.ceil(totalMinutes / 15) * 15;
}

function formatTimeString(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function getBusinessHoursForDate(dateValue) {
  const inputDate = dateValue ? new Date(`${dateValue}T12:00:00Z`) : new Date();
  const weekday = inputDate.getUTCDay();

  if (weekday >= 1 && weekday <= 4) {
    return { open: 11 * 60 + 30, close: 22 * 60 };
  }

  if (weekday === 5 || weekday === 6) {
    return { open: 11 * 60 + 30, close: 22 * 60 + 30 };
  }

  return { open: 12 * 60, close: 22 * 60 };
}

function buildSlots(date, party) {
  const maxParty = Number(party) || 2;
  const slots = [];

  const dateString = String(date || '').trim();
  const currentDate = new Date();
  const cstNow = getCstParts(currentDate);
  const currentDateString = `${String(cstNow.year).padStart(4, '0')}-${String(cstNow.month).padStart(2, '0')}-${String(cstNow.day).padStart(2, '0')}`;
  const businessHours = getBusinessHoursForDate(dateString || currentDateString);
  const openStartMinutes = businessHours.open;
  const closeEndMinutes = businessHours.close - 30;

  let earliestSlot = openStartMinutes;
  if (dateString && dateString === currentDateString) {
    const nowMinutes = cstNow.hour * 60 + cstNow.minute;
    earliestSlot = Math.max(openStartMinutes, ceilToQuarterHour(nowMinutes));
  }

  for (let totalMinutes = openStartMinutes; totalMinutes <= closeEndMinutes; totalMinutes += 15) {
    if (totalMinutes < earliestSlot) continue;
    const label = formatTimeString(totalMinutes);
    slots.push({
      time: label,
      label,
      tableIds: [`table-${Math.max(1, Math.min(8, maxParty))}`],
      startMin: totalMinutes,
      endMin: totalMinutes + 30
    });
  }

  return slots;
}

function makeHoldId(date, time, party) {
  const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  return `hold-${stamp}-${String(date).replace(/-/g, '')}-${String(time).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}-${party}`;
}

function makeBookingPayload(date, time, party) {
  const map = { '5:30 PM': 17 * 60 + 30, '6:00 PM': 18 * 60, '6:30 PM': 18 * 60 + 30, '7:00 PM': 19 * 60, '7:30 PM': 19 * 60 + 30, '8:00 PM': 20 * 60, '8:30 PM': 20 * 60 + 30 };
  const startMin = map[time] || 19 * 60;
  const endMin = startMin + 90;

  return {
    ok: true,
    booking: {
      id: makeHoldId(date, time, party),
      date,
      time,
      tableIds: ['table-1'],
      startMin,
      endMin,
      party: Number(party) || 2
    }
  };
}

function formatPhoneNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return 'Not provided';
  if (digits.length === 11 && digits.startsWith('1')) {
    const local = digits.slice(1);
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return String(raw).trim() || 'Not provided';
}

function formatReservationDate(dateValue) {
  if (!dateValue) return 'Not provided';
  const trimmed = String(dateValue).trim();
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }

  const [year, month, day] = trimmed.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' }).format(date);
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);

  return `${weekday}, ${formatted}`;
}

function parseHoldId(holdId) {
  if (!holdId || typeof holdId !== 'string') {
    return { date: '', time: '', partySize: 2 };
  }

  const parts = String(holdId).split('-');
  if (parts.length < 5 || parts[0] !== 'hold') {
    return { date: '', time: '', partySize: 2 };
  }

  const datePart = parts[3];
  const timePart = parts[4];
  const partyPart = parts[5] || '2';

  const date = datePart && /^\d{8}$/.test(datePart) ? `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}` : '';
  let time = '';

  if (timePart && /^(\d{1,2})(\d{2})(AM|PM)$/i.test(timePart)) {
    const match = timePart.match(/^(\d{1,2})(\d{2})(AM|PM)$/i);
    let hour = Number(match[1]);
    const minute = match[2];
    const meridiem = match[3].toUpperCase();

    if (meridiem === 'AM' && hour === 12) hour = 0;
    if (meridiem === 'PM' && hour < 12) hour += 12;

    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    time = `${formattedHour}:${minute} ${meridiem}`;
  }

  const partySize = Number(partyPart) || 2;
  return { date, time, partySize };
}

function formatSubmittedStamp(dateValue) {
  const date = dateValue ? new Date(dateValue) : new Date();
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date) + ' CDT';
}

function extractSeatingPreference(notes) {
  const cleanNotes = String(notes || '').trim();
  if (!cleanNotes) return '—';

  const normalized = cleanNotes.toLowerCase();
  if (normalized.includes('window')) return 'Window';
  if (normalized.includes('booth')) return 'Booth';
  if (normalized.includes('bar')) return 'Bar';
  if (normalized.includes('counter')) return 'Counter';
  if (normalized.includes('outside')) return 'Outside';
  return cleanNotes;
}

function doGet(e) {
  const request = e && e.parameter ? e.parameter : {};
  const action = String(getValue(request, 'action', '')).toLowerCase();
  const date = getValue(request, 'date', '');
  const party = Number(getValue(request, 'party', '2')) || 2;

  if (action === 'slots') {
    return respondJson({ ok: true, slots: buildSlots(date || new Date(), party) });
  }

  return respondJson({ ok: true, status: 'ready' });
}

function doPost(e) {
  try {
    const request = parseRequestBody(e);
    const action = String(getValue(request, 'action', '')).toLowerCase();

    if (action === 'slots') {
      const date = getValue(request, 'date', '');
      const party = Number(getValue(request, 'party', '2')) || 2;
      return respondJson({ ok: true, slots: buildSlots(date, party) });
    }

    if (action === 'hold') {
      const date = getValue(request, 'date', '');
      const time = getValue(request, 'time', '');
      const party = Number(getValue(request, 'party', '2')) || 2;
      if (!date || !time) {
        return respondJson({ ok: false, status: 'error', message: 'Missing date or time.' });
      }
      const holdId = makeHoldId(date, time, party);
      return respondJson({ ok: true, holdId, expiresInSeconds: 600, date, time, party });
    }

    if (action === 'confirm') {
      const holdId = getValue(request, 'holdId', '');
      const date = getValue(request, 'date', '');
      const time = getValue(request, 'time', getValue(request, 'selectedTime', '7:00 PM'));
      const party = Number(getValue(request, 'party', '2')) || 2;
      const name = getValue(request, 'name', 'Guest');
      const rawPhone = getValue(request, 'phone', 'Not provided');
      const phone = formatPhoneNumber(rawPhone);
      const email = getValue(request, 'email', '');
      const notes = getValue(request, 'notes', '');

      if (!holdId) {
        return respondJson({ ok: false, status: 'error', message: 'Missing hold ID.' });
      }

      const holdMeta = parseHoldId(holdId);
      const resolvedDate = date || holdMeta.date || new Date();
      const resolvedTime = time && time !== '7:00 PM' ? time : (holdMeta.time || time || '7:00 PM');
      const resolvedParty = Number(party) > 1 || String(party) !== '2' ? Number(party) : (holdMeta.partySize || Number(party) || 2);

      const bookingDate = resolvedDate || new Date();
      const booking = makeBookingPayload(bookingDate, resolvedTime, resolvedParty).booking;
      booking.name = name;
      booking.phone = phone;
      booking.email = email;
      booking.notes = notes;

      const reservationDateText = formatReservationDate(booking.date);
      const submittedStamp = formatSubmittedStamp(new Date());
      const guestCountText = `${Number(resolvedParty) || 1} guest${Number(resolvedParty) === 1 ? '' : 's'}`;
      const seating = extractSeatingPreference(notes);
      const subject = `New Reservation — ${name}, ${formatReservationDate(booking.date).replace(/, /, ' ')}, ${resolvedTime} (${guestCountText})`;

      const emailBody = [
        'NEW RESERVATION',
        '───────────────────────────────',
        `Date        ${reservationDateText}`,
        `Time        ${resolvedTime}`,
        `Party Size  ${guestCountText}`,
        `Seating     ${seating}`,
        '───────────────────────────────',
        `Guest       ${name}`,
        `Phone       ${phone}`,
        `Email       ${email || 'Not provided'}`,
        '───────────────────────────────',
        `Notes       ${notes && notes.trim() ? notes : '—'}`,
        '',
        `Submitted   ${submittedStamp}`,
        `Hold ID     ${holdId}`
      ].join('\n');

      const mailOptions = {
        to: 'ninjasushigrill@gmail.com',
        subject,
        body: emailBody
      };

      if (email) {
        mailOptions.replyTo = email;
      }

      MailApp.sendEmail(mailOptions);

      return respondJson({ ok: true, booking });
    }

    const fullName = getValue(request, 'Full Name', 'Not provided');
    const email = getValue(request, 'Email', '');
    const phone = getValue(request, 'Phone', 'Not provided');
    const preferredDate = getValue(request, 'Preferred Date', 'Not provided');
    const reason = getValue(request, 'Reason', 'Not provided');
    const guests = getValue(request, 'Guests', 'Not provided');
    const heardAboutUs = getValue(request, 'Heard About Us', 'Not provided');
    const message = getValue(request, 'Message', 'No message provided');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      return respondJson({ ok: false, status: 'error', message: 'Invalid email.' });
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
      replyTo: email,
      subject: 'New message — Ninja Revolving Sushi website',
      body: emailBody
    });

    const smsBody = [
      'Ninja Revolving Sushi website inquiry',
      'Name: ' + fullName,
      'Phone: ' + phone,
      'Email: ' + email,
      'Reason: ' + reason,
      'Message: ' + message
    ].join('\n');

    const smsResult = sendSmsAlert(smsBody);
    if (smsResult.ok === false && smsResult.status !== 'not_configured') {
      return respondJson({
        ok: false,
        status: 'error',
        message: 'Email sent, but SMS failed. Check Twilio credentials and recipient number.'
      });
    }

    return respondJson({ ok: true, status: 'success', message: 'Message sent successfully.' });
  } catch (err) {
    return respondJson({ ok: false, status: 'error', message: err && err.message ? err.message : String(err) });
  }
}
