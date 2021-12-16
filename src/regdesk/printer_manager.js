import { LabelEpl, LP2844 } from 'WebZLP/src/LP2844'

export class PrinterManager {
    #devices = [];
    #printers = [];

    primaryPrinter = 0;
    secondaryPrinter = 1;

    #printerType = LP2844;

    constructor() {
    }

    get printers() { return this.#printers; }

    async printerConnect(e) {
        if (!this.#devices.includes(e.device)) {
            this.#devices.push(e.device);
            let printer = new this.#printerType(e.device);
            await printer.connect();
            this.#printers.push(printer);
            this.primaryPrinter = 0;
        }
    }

    async printerDisconnect(e) {
        const idx = this.#devices.findIndex(i => e.device == i);
        if (idx > -1) {
            const p = this.#printers[idx];
            this.#devices.splice(idx, 1);
            this.#printers.splice(idx, 1);
            this.resetPrinterButtons();
            await p.dispose();
        }
    }

    async printerPair() {
        try {
            let device = await navigator.usb.requestDevice({
                filters: [
                    { vendorId: this.#printerType.usbVendorId }
                ]
            });

            await this.printerConnect( { device : device} )
        } catch (e) {
            console.log("Failed to connect to printer!");
            console.log(e);
            return;
        }
    }

    async printerReload(e) {
        this.#devices = [];
        this.#printers.forEach(p => p.dispose());
        this.#printers = [];

        navigator.usb.getDevices().then((printers) => {
            printers.forEach(async d => {
                await this.printerConnect( { device : d });
            });
        });
    }

}