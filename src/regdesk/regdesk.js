import { PrinterManager } from './printer_manager.js';
import { PrinterDropdown } from './printer_dropdown.js';
import { BadgeLabelBuilder } from './label_builder.js';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-dark-5/dist/css/bootstrap-dark-plugin.min.css';
import { RegMachineArgs } from './states/reg_machine_args.js';
import { RegMachineManager } from './states/reg_machine_manager.js';
import { CommunicationManager } from './communication_manager.js';
import { ManualPrintModal } from './manual_print_modal.js';

/**
 * Configure the printer manager for this page
 *
 * @param {Object} o - Argument container
 * @param {PrinterManager} o.mgr - The printer manager to configure
 * @param {PrinterDropdown} o.adultDropdown - The dropdown object managing the Clear printer.
 * @param {PrinterDropdown} o.minorDropdown - The dropdown object managing the Minor printer.
 * @param {Navigator} o.nav - The browser Navigator.
 * @return {PrinterManager} - The resulting printer manager.
 */
function configureManager({
  mgr,
  adultDropdown = new PrinterDropdown(PrinterDropdown.getElementsOnPage('adult', document)),
  minorDropdown = new PrinterDropdown(PrinterDropdown.getElementsOnPage('minor', document)),
  nav = navigator,
} = {}) {
  mgr = mgr || new PrinterManager(nav, adultDropdown, minorDropdown);
  return mgr;
}

let printerMgr;
// eslint-disable-next-line no-unused-vars
let regStateMachine;
const fontLoader = BadgeLabelBuilder.loadCustomFonts(document);

document.addEventListener('readystatechange', async () => {
  if (document.readyState === 'complete') {
    printerMgr = configureManager();
    await printerMgr.refreshPrinters();
    await fontLoader;

    const printModal = ManualPrintModal.getFromDocument(document);
    printModal.addEventListener(ManualPrintModal.events.PRINT_LABEL, (e) => {
      printerMgr.printLabelBuilder(e.detail);
    });

    const commMgr = new CommunicationManager();

    const stateArgs = RegMachineArgs.getFromDocument(document, printerMgr, commMgr);

    regStateMachine = new RegMachineManager(stateArgs);

    // At this point we can assume other things successfully loaded and can hide
    // the help text
    document.getElementById('hideAfterPageLoad').classList.add('d-none');
  }
});
