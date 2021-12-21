import { PrinterManager } from './printer_manager.js';
import { PrinterDropdown } from './printer_dropdown.js';
import { BadgeLabelBuilder } from './label_builder.js';

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
var fontLoader = BadgeLabelBuilder.loadCustomFonts(document);

document.addEventListener('readystatechange', async () => {
  if (document.readyState === "complete") {
    printerMgr = configureManager();
    await printerMgr.refreshPrinters();
    await fontLoader;

    ///////////////////
    // Demonstration code! This will work on -your- machine!

    let canvas = document.getElementById("canvas");
    let label = new BadgeLabelBuilder({
      line1: "A Furry 🍑",
      line2: "Just some furry name",
      badgeId: "12345678",
      level: "Super Sponsor",
      isMinor: false,
    });

    // You wouldn't normally call this directly, and instead use addToLabel like below
    // Present here for demo purposes.
    label.renderToImageData(canvas.width, canvas.height, canvas);

    // Demo of the more average use, commented out so I stop accidentally printing labels.

    // let label = new BadgeLabelBuilder({
    //   line1: "A Furry 🍑",
    //   line2: "Just some furry name",
    //   badgeId: "12345678",
    //   level: "Super Sponsor",
    //   isMinor: false,
    // });

    //let plabel = printerMgr.getAdultLabel();
    //await label.addToLabel(plabel);
    //await printerMgr.printAdultLabel(plabel);
  }
});
