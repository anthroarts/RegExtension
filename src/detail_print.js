console.debug('Injected detail print script');

import { sendBackgroundScriptAMessage, MESSAGE_TYPE } from './coms/communication.js';
import { RegistrantDetails } from './regdesk/registrant_details.js';

/**
 * Wait for an element to be present on the page.
 * @param {string} selector - The CSS selector to wait for
 * @return {Element} The element being waited for
 */
async function waitForElement(selector) {
  let failLimit = 40; // 40 = 8 seconds.
  let element = document.querySelector(selector);
  while (!element && failLimit > 0) {
    failLimit--;
    element = document.querySelector(selector);
    await new Promise((r) => setTimeout(r, 200));
  }
  return element;
}

/**
 * Get the details for a reg data table entry.
 * @param {string} fieldName - The text field name from the reg details table
 * @return {string} The value of the table
 */
function getDetail(fieldName) {
  const th = [...document.querySelectorAll('th')]
    .filter((el) => el.textContent.indexOf(fieldName) > -1);

  if (th.length > 0) {
    return th[0]?.nextElementSibling.textContent ?? '';
  }
  return '';
}

/**
 * Get the details for a registrant off the page.
 * @return {RegistrantDetails} The registrant details.
 */
function getRegDetails() {
  // Check in is special in that it includes buttons. We want just the direct node text.
  const rawCheckInData = getDetail('Checked In Status');
  const checkSplit = rawCheckInData.split('\n');
  let checkinDate = rawCheckInData;
  if (checkSplit.length > 0) {
    checkinDate = checkSplit[1].trim();
  }

  return new RegistrantDetails({
    badgeId: document.location.href.split('/').pop(),
    badgeLine1: getDetail('Badge Line 1 Text'),
    badgeLine2: getDetail('Badge Line 2 Text'),
    sponsorLevel: getDetail('Membership Levels'),
    birthdate: getDetail('Date of Birth'),
    legalName: getDetail('Legal Name'),
    preferredName: getDetail('Preferred first name'),
    checkinDate: checkinDate,
    conbookCount: getDetail('Souvenir Conbook'),
    paymentStatus: getDetail('Status'),
  });
}

/**
 * Send a request to print a badge to the RegDesk page and printers.
 */
function printBadge() {
  const regDetails = getRegDetails();

  if (!regDetails.isPaid) {
    // Most reliable way to ask the user..
    const bypassPayment = window.confirm('The payment status in not "Completed". Are you sure you want to print this badge?');
    if (!bypassPayment) {
      return;
    }
  }

  console.debug('Sending reg details to printer.', regDetails);

  sendBackgroundScriptAMessage(
    MESSAGE_TYPE.printLabel,
    { registrantDetails: regDetails },
    (r) => {
      if (!r.success) {
        // Not great, but the most reliable way to pop up a dialog.
        alert('There was an error printing the badge, see the RegDesk page for details.');
      }
    });
}

const buttonRowSelector = 'div.page-action.button-set';
waitForElement(buttonRowSelector)
  .then((buttonRow) => {
    const printButton = document.createElement('a');
    printButton.classList.add('btn');
    printButton.href = '#';
    printButton.textContent = 'Print Badge';

    const printButtonIcon = document.createElement('i');
    printButtonIcon.classList.add('fa', 'fa-print');
    printButton.prepend(printButtonIcon);

    printButton.addEventListener('click', printBadge);

    buttonRow.prepend(printButton);
  });
