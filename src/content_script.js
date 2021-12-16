import $ from "jquery";

function getBadgeLine1() {
    var Badge_Line_1;
    Badge_Line_1 = $("th:contains('Badge Line 1 Text')");

    console.log("Badge line 1: ");
    console.log(Badge_Line_1.length);

    if (Badge_Line_1) {
        console.log(Badge_Line_1.next().text());
        return Badge_Line_1.next().text();
    }
    return "&nbsp;"
}

function getBadgeLine2() {
    var Badge_Line_2;
    Badge_Line_2 = $("th:contains('Badge Line 2 Text')");

    if (Badge_Line_2.length != 0) {
        console.log(Badge_Line_2.next().text());
        return Badge_Line_2.next().text();
    }

    return "&nbsp;"
}

function getRegLevel() {
    var regLevel = $("th:contains('Membership Levels')");

    regLevel = regLevel.next().text();

    if (regLevel.includes("Friday") || regLevel.includes("Saturday") || regLevel.includes("Sunday")) {
        return regLevel.toUpperCase();
    }
    return regLevel;
}

function getMinorStatus() {
    var ms_cell1 = $("th:contains('Age as of January 12, 2017')");
    var ms_cell2 = $("th:contains('Age')");

    var minor_Status = (ms_cell1.length) ? ms_cell1.next().text() : ms_cell2.next().text();
    var age = minor_Status.split("-")[0];

    console.log(ms_cell1)
    console.log(ms_cell2)

    var return_string = "&nbsp;"

    if (age < 18) {
        return_string = "Minor";
    }

    return return_string;
}

function getRegId() {
    var regNumber = document.location.href.split("/").pop();
    console.log(regNumber);
    return regNumber;
}

var firstLine = getBadgeLine1();
var secondLine = getBadgeLine2();
var regNumber = getRegId();
var regLevel = getRegLevel();
var minorStatus = getMinorStatus();

var iFrameHtml = `
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

var iFrame = document.createElement('iFrame');
//iFrame.style.display = 'none';
iFrame.onload = function () {
    console.log('iFrame loaded');
};
document.body.appendChild(iFrame);

var ifdoc = iFrame.contentWindow.document;
ifdoc.open();
ifdoc.write(iFrameHtml);
ifdoc.close();
iFrame.contentWindow.print();