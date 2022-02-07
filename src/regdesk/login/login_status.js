/**
 * Class is a wrapper around the LoginStatus HTML and helps process user input.
 */
export class LoginStatus {
  /**
   * @param {*} f - fields on the status.
   * @param {Element} f.regfoxStatusConnected - the status online html element.
   * @param {Element} f.regfoxStatusDisconnected - the status offline html element.
   */
  constructor({ regfoxStatusConnected, regfoxStatusDisconnected }) {
    this.regfoxStatusConnected = regfoxStatusConnected;
    this.regfoxStatusDisconnected = regfoxStatusDisconnected;
  }

  /**
   * Set the status to be isConnected.
   * @param {boolean} isConnected is true if online with regfox.
   */
  setStatus(isConnected) {
    if (isConnected) {
      this.regfoxStatusConnected.classList.add('visible');
      this.regfoxStatusConnected.classList.remove('visually-hidden');
      this.regfoxStatusDisconnected.classList.add('visually-hidden');
      this.regfoxStatusDisconnected.classList.remove('visible');
    } else {
      this.regfoxStatusConnected.classList.add('visually-hidden');
      this.regfoxStatusConnected.classList.remove('visible');
      this.regfoxStatusDisconnected.classList.add('visible');
      this.regfoxStatusDisconnected.classList.remove('visually-hidden');
    }
  }

  /**
   * Grabs the button/email/etc fields from the modal html.
   * @param {Document} document - The document element to find the elements on the page.
   * @return {LoginStatus} - Ready to go login status.
   */
  static getFromDocument(document) {
    const regfoxStatusConnected = document.getElementById('regfoxStatusConnected');
    const regfoxStatusDisconnected = document.getElementById('regfoxStatusDisconnected');

    return new LoginStatus({ regfoxStatusConnected, regfoxStatusDisconnected });
  }
}
