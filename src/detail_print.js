console.debug('Injected detail print script');

import { sendBackgroundScriptAMessage, MESSAGE_TYPE } from './coms/communication.js';

/**
 * Wait for an element to be present on the page.
 * @param {string} selector - The CSS selector to wait for
 * @return {Element} The element being waited for
 */
async function waitForElement(selector) {
  let element = document.querySelector(selector);
  while (!element) {
    element = document.querySelector(selector);
    await new Promise((r) => setTimeout(r, 200));
  }
  return element;
}

/**
 * Returns a value indicating whether the payment is complete.
 * @return {boolean} Whether payment is completed
 */
function isPaymentCompleted() {
  const payStatus = document.querySelector('tr[ng-if*="report.statusString"] > td').textContent;
  return payStatus === 'Completed';
}

/**
 * Get the details for a reg data table entry.
 * @param {string} fieldName - The text field name from the reg details table
 * @return {string} The value of the table
 */
function getDetail(fieldName) {
  const regDetailTable = document.querySelector('div[ng-include*="data.html"] > table');
  const th = [...regDetailTable.querySelectorAll('th')]
    .filter((el) => el.textContent.indexOf(fieldName) > -1);

  if (th.length > 0) {
    return th[0]?.nextElementSibling.textContent ?? '';
  }
  return '';
}

/**
 * Get an age in years between the birthdate and today.
 * @param {string} birthdate - The raw birthdate string, in YYYY-mm-dd format.
 * @param {Date} today - The 'today' value to use. Defaults to new Date().
 * @return {number} - Age in years between the birthdate and today.
 */
function getAge(birthdate, today = new Date()) {
  // TODO: This method should move to a dedicated Registrant class.
  const yearInMs = 3.15576e+10;
  return Math.floor((today - new Date(birthdate).getTime()) / yearInMs);
}

/**
 * Get the details for a badge.
 * @return {*} The details to populate a BadgeLabelBuilder
 */
function getBadgeDetails() {
  const dob = getDetail('Date of Birth');
  const age = getAge(dob);
  return {
    line1: getDetail('Badge Line 1 Text'),
    line2: getDetail('Badge Line 2 Text'),
    level: getDetail('Membership Levels'),
    badgeId: document.location.href.split('/').pop(),
    isMinor: (age < 18),
  };
}

/**
 * Send a request to print a badge to the RegDesk page and printers.
 */
function printBadge() {
  if (!isPaymentCompleted()) {
    // Most reliable way to ask the user..
    const bypassPayment = window.confirm('The payment status in not "Completed". Are you sure you want to print this badge?');
    if (!bypassPayment) {
      return;
    }
  }

  const labelDetails = getBadgeDetails();
  console.log(labelDetails);

  sendBackgroundScriptAMessage(
    MESSAGE_TYPE.printLabel,
    { labelDetails: labelDetails },
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
