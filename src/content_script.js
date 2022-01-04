/* eslint-disable require-jsdoc */

function getDetail(fieldName) {
  const th = [...document.querySelectorAll('th')]
    .filter((el) => el.textContent.indexOf(fieldName) > -1);

  if (th.length > 0) {
    return th[0].nextElementSibling.textContent;
  }
  return '&nbsp;';
}

function getBadgeLine1() {
  const badgeLine1 = getDetail('Badge Line 1 Text');

  console.log('Badge line 1: ');
  console.log(badgeLine1);
  return badgeLine1;
}

function getBadgeLine2() {
  const badgeLine2 = getDetail('Badge Line 2 Text');

  console.log('Badge line 2: ');
  console.log(badgeLine2);
  return badgeLine2;
}

function getRegLevel() {
  const regLevel = getDetail('Membership Levels');

  if (regLevel.includes('Friday') || regLevel.includes('Saturday') || regLevel.includes('Sunday')) {
    return regLevel.toUpperCase();
  }
  return regLevel;
}

function getMinorStatus() {
  const birthDateString = getDetail('Date of Birth');
  console.log('Date of birth:');
  console.log(birthDateString);

  const birthDate = new Date(birthDateString);
  const eighteenAsOfDate = new Date('2004-01-13');

  if (birthDate > eighteenAsOfDate) {
    return 'Minor';
  }

  return '&nbsp;';
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
iFrame.onload = function () {
  console.log('iFrame loaded');
};
document.body.appendChild(iFrame);

const ifdoc = iFrame.contentWindow.document;
ifdoc.open();
ifdoc.write(iFrameHtml);
ifdoc.close();

iFrame.contentWindow.onafterprint = () => {
  iFrame.remove();
};
iFrame.contentWindow.print();
