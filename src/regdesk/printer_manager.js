import { LabelEpl, LP2844 } from 'C:/Git/WebZLP/src/index.js'

export class PrinterManager {
    #devices = [];
    #printers = [];

    primaryPrinter;
    secondaryPrinter;

    #printerType = LP2844;

    constructor() {
    }

    getLabel() { return new LabelEpl(0, 0, 0); }

    async printerConnect(e) {

    }

    async printerDisconnect(e) {

    }

    async printerPair(e) {

    }

    async printerReload(e) {

    }
}