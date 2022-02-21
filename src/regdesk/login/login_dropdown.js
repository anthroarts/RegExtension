/**
 * Class is a wrapper around the Login/Logout HTML buttons in the top left Button.
 */
export class LoginDropdown {
  /**
   * Initializes a new instance of this class.
   * @param {*} f - fields found in the Button
   * @param {Element} f.loginButton - The login button from the Button.
   * @param {Element} f.logoutButton  - The logout button from the Button.
   * @param {Function} showModalFunction - The LoginModal showModal function.
   * @param {Function} logoutFunction - The LoginManager logout function.
   */
  constructor({ loginButton, logoutButton }, showModalFunction, logoutFunction) {
    this.loginButton = loginButton;
    this.logoutButton = logoutButton;

    loginButton.addEventListener('click', showModalFunction);
    logoutButton.addEventListener('click', async () => {
      await logoutFunction();
      await showModalFunction();
    });
  }

  /**
   * Set the login/logout buttons based on isConnected.
   * @param {boolean} isConnected is true if online with regfox.
   */
  setStatus(isConnected) {
    if (isConnected) {
      this.loginButton.classList.add('invisible');
      this.loginButton.classList.remove('visible');
      this.logoutButton.classList.add('visible');
      this.logoutButton.classList.remove('invisible');
    } else {
      this.loginButton.classList.add('visible');
      this.loginButton.classList.remove('invisible');
      this.logoutButton.classList.add('invisible');
      this.logoutButton.classList.remove('visible');
    }
  }

  /**
   * Grabs the button/email/etc fields from the Button html.
   * @param {Document} document - The document element to find the elements on the page.
   * @param {Function} showModalFunction - The LoginModal showModal function.
   * @param {Function} logoutFunction - The LoginManager logout function.
   * @return {LoginDropdown} - Ready to go LoginDropdown.
   */
  static getFromDocument(document, showModalFunction, logoutFunction) {
    const loginButton = document.getElementById('loginDropdownButton');
    const logoutButton = document.getElementById('logoutDropdownButton');

    return new LoginDropdown(
      { loginButton, logoutButton },
      showModalFunction, logoutFunction);
  }
}
