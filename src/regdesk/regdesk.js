import { PrinterManager } from './printer_manager.js';
import { PrinterDropdown } from './printer_dropdown.js';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-dark-5/dist/css/bootstrap-dark-plugin.min.css';

/**
 * Configure the printer manager for this page
 *
 * @param {Object} o - Argument container
 * @param {PrinterManager} o.mgr - The printer manager to configure
 * @param {PrinterDropdown} o.adultDropdown - The dropdown object managing the Clear printer.
 * @param {PrinterDropdown} o.minorDropdown - The dropdown object managing the Minor printer.
 * @param {Navigator} o.nav - The browser Navigator
 */
function configureManager({
  mgr,
  adultDropdown = new PrinterDropdown(PrinterDropdown.getElementsOnPage("adult", document)),
  minorDropdown = new PrinterDropdown(PrinterDropdown.getElementsOnPage("minor", document)),
  nav = navigator,
} = {}) {
  mgr = mgr || new PrinterManager(nav, adultDropdown, minorDropdown);
  return mgr;
}

var printerMgr;

document.addEventListener('readystatechange', async () => {
  if (document.readyState === "complete") {
    printerMgr = configureManager();
    await printerMgr.refreshPrinters();
  }
});
