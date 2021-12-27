/* eslint-disable require-jsdoc */
import $  from 'jquery';

function getBadgeLine1() {
  const badgeLine1 = $('th:contains(\'Badge Line 1 Text\')');

  console.log('Badge line 1: ');
  console.log(badgeLine1.length);

  if (badgeLine1) {
    console.log(badgeLine1.next().text());
    return badgeLine1.next().text();
  }
  return '&nbsp;';
}

function getBadgeLine2() {
  const badgeLine2 = $('th:contains(\'Badge Line 2 Text\')');

  if (badgeLine2.length != 0) {
    console.log(badgeLine2.next().text());
    return badgeLine2.next().text();
  }

  return '&nbsp;';
}

function getRegLevel() {
  let regLevel = $('th:contains(\'Membership Levels\')');

  regLevel = regLevel.next().text();

  if (regLevel.includes('Friday') || regLevel.includes('Saturday') || regLevel.includes('Sunday')) {
    return regLevel.toUpperCase();
  }
  return regLevel;
}

function getMinorStatus() {
  const minorCell1 = $('th:contains(\'Age as of January 12, 2017\')');
  const minorCell2 = $('th:contains(\'Age\')');

  const minorStatus = (minorCell1.length) ? minorCell1.next().text() : minorCell2.next().text();
  const age = minorStatus.split('-')[0];

  console.log(minorCell1);
  console.log(minorCell2);

  let minorString = '&nbsp;';

  if (age < 18) {
    minorString = 'Minor';
  }

  return minorString;
}

function getRegId() {
  const regNumber = document.location.href.split('/').pop();
  console.log(regNumber);
  return regNumber;
}

const firstLine = getBadgeLine1();
const secondLine = getBadgeLine2();
const regNumber = getRegId();
const regLevel = getRegLevel();
const minorStatus = getMinorStatus();

const iFrameHtml = `
<html>
<style>

body {
font-family: sans-serif;
margin-top: 0in;
margin-bottom: 0;
margin-left: 0.06in;
margin-right: 0;
width: 261px;
}

.badge-name1 {
position: absolute;
top: 10px;
left: 7px;
font-weight: bold;
font-size: 25px;
}

.badge-name2 {
position: absolute;
top: 40px;
left: 7px;
font-size: 11px;
}

.registration-number {
position: absolute;
top: 65px;
left: 7px;
font-size: 10px;
text-align: left;
}

.registration-level {
position: absolute;
top: 60px;
left: 0px;
font-size: 16px;
text-align: center;
width: 261px;
}
.minor {
position: absolute;
top: 60px;
left: 0px;
width: 261px;
font-size: 14px;
text-align: right;
}

</style>

<body>
<div class="badge-name1">${firstLine}</div>
<div class="badge-name2">${secondLine}</div>
<div class="registration-number">${regNumber}</div>
<div class="registration-level">${regLevel}</div>
<div class="minor">${minorStatus}</div>
</body>
</html>
`;

const iFrame = document.createElement('iFrame');
// iFrame.style.display = 'none';
iFrame.onload = function() {
  console.log('iFrame loaded');
};
document.body.appendChild(iFrame);

const ifdoc = iFrame.contentWindow.document;
ifdoc.open();
ifdoc.write(iFrameHtml);
ifdoc.close();
iFrame.contentWindow.print();
