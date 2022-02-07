import { PrinterManager } from './printer_manager.js';
import { PrinterDropdown } from './printer_dropdown.js';
import { BadgeLabelBuilder } from './label_builder.js';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-dark-5/dist/css/bootstrap-dark-plugin.min.css';

import { RegMachineArgs } from './states/reg_machine_args.js';
import { RegMachineManager } from './states/reg_machine_manager.js';
import { CommunicationManager } from './communication_manager.js';
import { PrinterConfigModal } from './printer_config_modal.js';
import { ManualPrintModal } from './manual_print_modal.js';
import { TogglePaymentsBtn } from './toggle_payments_btn.js';

import { LoginManager } from './login/login_manager.js';
import { LoginModal } from './login/login_modal.js';
import { LoginStatus } from './login/login_status.js';
import { LoginDropdown } from './login/login_dropdown.js';

/**
 * Configure the printer manager for this page
 *
 * @param {Object} o - Argument container
 * @param {PrinterManager} o.mgr - The printer manager to configure
 * @param {PrinterDropdown} o.adultDropdown - The dropdown object managing the Clear printer.
 * @param {PrinterDropdown} o.minorDropdown - The dropdown object managing the Minor printer.
 * @param {Navigator} o.nav - The browser Navigator.
 * @param {PrinterConfigModal} o.configModal - The printer configuration modal.
 * @return {PrinterManager} - The resulting printer manager.
 */
function configureManager({
  mgr,
  adultDropdown = new PrinterDropdown(PrinterDropdown.getElementsOnPage('adult', document)),
  minorDropdown = new PrinterDropdown(PrinterDropdown.getElementsOnPage('minor', document)),
  nav = navigator,
  configModal = new PrinterConfigModal(document.getElementById('printerOptionModal')),
} = {}) {
  mgr = mgr || new PrinterManager(nav, adultDropdown, minorDropdown, configModal);
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

    const togglePaymentsBtn = new TogglePaymentsBtn(document.getElementById('togglePaymentsBtn'));
    const commMgr = new CommunicationManager(printerMgr, togglePaymentsBtn);

    const stateArgs = RegMachineArgs.getFromDocument(document, printerMgr, commMgr);

    regStateMachine = new RegMachineManager(stateArgs);

    const loginManager = new LoginManager();
    const loginModal = LoginModal.getFromDocument(document, loginManager.login.bind(loginManager));
    const loginStatus = LoginStatus.getFromDocument(document);
    const loginDropdown = LoginDropdown.getFromDocument(document, loginModal.showModal.bind(loginModal), loginManager.logout.bind(loginManager));
    loginManager.addEventListener(LoginManager.events.SET_REGFOX_LOGIN_STATUS, (e) => loginStatus.setStatus(e.detail.isLoggedIn));
    loginManager.addEventListener(LoginManager.events.SET_REGFOX_LOGIN_STATUS, (e) => loginDropdown.setStatus(e.detail.isLoggedIn));
    loginManager.isLoggedIn().then((isLoggedIn) =>
      loginStatus.setStatus(isLoggedIn) || loginDropdown.setStatus(isLoggedIn) ||
      (!isLoggedIn) && loginModal.showModal());

    // At this point we can assume other things successfully loaded and can hide
    // the help text
    document.getElementById('hideAfterPageLoad').classList.add('d-none');
  }
});
