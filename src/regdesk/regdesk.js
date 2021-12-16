import { PrinterManager } from './printer_manager.js';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-dark-5/dist/css/bootstrap-dark-plugin.min.css';

////////////////////////////////////
// This is pretty much just PoC test code to make sure this actually functions
// Pretty much none of this will exist in the final version.

function resetPrinterButtons(printerMgr) {
    document.getElementById("printerlist").innerHTML = "";
    printerMgr.printers.forEach((printer, index) => drawPrinterButton(printer, index));
}

function drawPrinterButton(printer, index) {
    let element = document.createElement("div");
    element.innerHTML = `
<li id="printer_${index}" data-device-id="${index}"
class="list-group-item d-flex flex-row justify-content-between sligh-items-start"
style="background: linear-gradient(to right, transparent, transparent, ${printer.labelColor}, ${printer.labelColor});">
<div class="col-sm-8">
<div class="col-sm-12">
    <span data-serial="${printer.serial}">${printer.serial}</span>
</div>
<div class="col-sm-12">
    <span>${printer.labelWidth}" x ${printer.labelHeight}"</span>
</div>
</div>
<div class="d-flex flex-row justify-content-end">
<div class="btn-group" role="group" aria-label="Printer button group">
    <button id="printto_${index}" class="btn btn-success btn-lg" data-label-width="${printer.labelWidth}" data-label-height="${printer.labelHeight}" data-device-id="${index}">🖨</button>
        <button class="btn btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="visually-hidden">Settings</span>
        </button>
        <ul class="dropdown-menu">
            <li><a id="printtest_${index}" data-device-id="${index}" class="dropdown-item" href="#">
                Print test page
            </a></li>
            <li><a id="autosense_${index}" data-device-id="${index}" class="dropdown-item" href="#">
                AutoSense length
            </a></li>
            <li><a id="configprinter_${index}" data-device-id="${index}" class="dropdown-item" href="#">
                Set label config
            </a></li>
            <li><a id="cutprinter_${index}" data-device-id="${index}" class="dropdown-item" href="#">
                Cut label
            </a></li>
        </ul>
    </div>
</div>
</div>
</li>`;
    document.getElementById("printerlist").appendChild(element);

    document.getElementById(`printto_${index}`)
        .addEventListener('click', async (e) => {
            e.preventDefault();
            let deviceId = e.target.dataset.deviceId;
            printerMgr.printForm(deviceId);
        });

    document.getElementById(`autosense_${index}`)
        .addEventListener('click', async (e) => {
            e.preventDefault();
            let deviceId = e.target.dataset.deviceId;
            await printerMgr.printers[deviceId].configLabelWidth();
            await printerMgr.printers[deviceId].setLabelHeightCalibration();
        });

    document.getElementById(`printtest_${index}`)
        .addEventListener('click', async (e) => {
            e.preventDefault();
            let deviceId = e.target.dataset.deviceId;
            await printerMgr.printers[deviceId].printTestPage();
        });

    document.getElementById(`cutprinter_${index}`)
        .addEventListener('click', async (e) => {
            e.preventDefault();
            let deviceId = e.target.dataset.deviceId;
            await printerMgr.printers[deviceId].addCmd("C").print();
        });
}

////////////////////////////////
// End most of the test code, though the rest of this will change too.


var printerMgr;

document.addEventListener('readystatechange', async () => {
    if (document.readyState === "complete") {

        const printerList = document.getElementById("printerlist");
        printerMgr = new PrinterManager();

        document.getElementById("addprinter").addEventListener('click', async () => {
            await printerMgr.printerPair();
            resetPrinterButtons(printerMgr);
        });

        navigator.usb.addEventListener('connect', async (e) => printerMgr.printerConnect(e));
        navigator.usb.addEventListener('disconnect', async (e) => printerMgr.printerDisconnect(e));
    }
});