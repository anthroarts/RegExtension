function getBadgeLine1() {
	var Badge_Line_1;
	Badge_Line_1 = $("th:contains('Badge Line 1 Text')");
	
	console.log("Badge line 1: ");
	console.log(Badge_Line_1.length);
	
	if(Badge_Line_1) {
		console.log(Badge_Line_1.next().text());
		return Badge_Line_1.next().text();
	}
	return "&nbsp;"
}

function getBadgeLine2() {
	var Badge_Line_2;
	Badge_Line_2 = $("th:contains('Badge Line 2 Text')");
	
	if(Badge_Line_2.length != 0) {
		console.log(Badge_Line_2.next().text());
		return Badge_Line_2.next().text();
	}
	
	return "&nbsp;"
}

function getRegLevel() {
	var regLevel = $("th:contains('Membership Levels')");
	return regLevel.next().text();
}

function getMinorStatus() {
	var ms_cell = $("th:contains('Age as of January 12, 2017')");
	var minor_Status = ms_cell.next().text();
	var age = minor_Status.split("-")[0];
	
	if(age < 18) {
		return "Minor";
	}
	
	return "&nbsp;";
}

var firstLine = getBadgeLine1();
var secondLine = getBadgeLine2();
var regNumber = "1234";
var regLevel = getRegLevel();
var minorStatus = getMinorStatus();

var iFrameHtml = `
<html>
<style>

body {
	font-family: sans-serif;
	margin-top: 0.04in;
	margin-bottom: 0;
	margin-left: 0.06in;
	margin-right: 0;
}

.badge-name1 {
	column-span: 3;
	font-size: 21px;
}

.badge-name2 {
	column-span: 3;
	font-size: 19px;
}

.registration-number {
	font-size: 16px;
	text-align: left;
	width: 87px;
}

.registration-level {
	font-size: 20px;
	text-align: center;
	vertical-align: middle;
	width: 87px;
}
.minor {
	font-size: 16px;
	text-align: right;
	width: 87px;
}

table{
    table-layout: fixed;
    width: 261px;
}


</style>
<body>
	<table>
		<tr>
			<td colspan="3" class="badge-name1">${firstLine}</td>
		</tr>
		<tr>
			<td colspan="3" class="badge-name2">${secondLine}</td>
		</tr>
		<tr>
			<td class="registration-number">${regNumber}</td>
			<td class="registration-level">${regLevel}</td>
			<td class="minor">${minorStatus}</td>
		</tr>
	</table>
</body>
</html>
`;

var iFrame = document.createElement('iFrame');
//iFrame.style.display = 'none';
iFrame.onload = function() { 
	console.log('iFrame loaded');
};
document.body.appendChild(iFrame);

var ifdoc = iFrame.contentWindow.document;
ifdoc.open();
ifdoc.write(iFrameHtml);
ifdoc.close();
iFrame.contentWindow.print();