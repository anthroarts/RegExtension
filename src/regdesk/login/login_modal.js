import { Modal } from 'bootstrap';

/**
 * Class is a wrapper around the LoginModal HTML and helps process user input.
 */
export class LoginModal {
  /**
   * Initializes a new instance of this class.
   * @param {*} o - action methods on the modal.
   * @param {Function} o.showModal - calling this method will show the modal.
   * @param {Function} o.hideModal - calling this method will hide the modal.
    * @param {*} f - fields found on the modal..
   * @param {Element} f.emailField - The email field from the modal.
   * @param {Element} f.passwordField  - The password field from the modal.
   * @param {Element} f.submitButton - The submitButton from the modal.
   * @param {Element} f.loginForm - The loginForm from the modal.
   * @param {Function} loginFunction - The LoginManager login function.
   */
  constructor({ showModal, hideModal }, { emailField, passwordField, submitButton, loginForm }, loginFunction) {
    this.emailField = emailField;
    this.passwordField = passwordField;
    this.showModal = showModal;
    this.hideModal = hideModal;
    this.loginFunction = loginFunction;
    loginForm.addEventListener('keyup', function (event) {
      if (event.code === 'Enter') {
        event.preventDefault();
        loginForm.submit();
      }
    });
    loginForm.addEventListener('submit', this.login.bind(this));
    submitButton.addEventListener('click', this.login.bind(this));
  }

  /**
   * Respond to a user clicking the submit button on the Login form.
   */
  async login() {
    const email = this.emailField.value;
    const password = this.passwordField.value;

    // TODO should probably make sure a user can't double click
    // and there is a nice spinner or something to show async processing.
    await this.loginFunction(email, password);
    this.hideModal();
  }

  /**
   * Grabs the button/email/etc fields from the modal html.
   * @param {Document} document - The document element to find the elements on the page.
   * @param {Function} loginFunction - The LoginManager login function.
   * @return {LoginModal} - Ready to go login modal.
   */
  static getFromDocument(document, loginFunction) {
    const modal = new Modal(document.getElementById('loginModal'), {});
    const showModal = modal.show.bind(modal);
    const hideModal = modal.hide.bind(modal);

    const loginForm = document.getElementById('loginForm');
    const emailField = document.getElementById('loginEmail');
    const passwordField = document.getElementById('loginPassword');
    const submitButton = document.getElementById('loginBtn');

    return new LoginModal(
      { showModal, hideModal },
      { emailField, passwordField, submitButton, loginForm },
      loginFunction);
  }
}
