
/**
 * Manager for handling communication to the extension and APIs.
 */
export class CommunicationManager {
  #selectedReg;
  /**
   * Get the single selected registration
   */
  get selectedSearchResult() {
    return this.#selectedReg;
  }

  #regResults;
  /**
   * Get the list of registrations from the most recent search.
   */
  get regSearchResults() {
    return this.#regResults;
  }

  /**
   * Get a value indicating whether there's more than one result loaded.
   */
  get hasMultipleResults() {
    return this.#regResults?.length > 1;
  }

  #searchPromise;
  /**
   * Get the promise for a search operation
   */
  get searchPromise() {
    return this.#searchPromise;
  }

  #searchString;
  /**
   * Get the string that was last searched for
   */
  get searchString() {
    return this.#searchString;
  }

  /**
   * Iniitalizes a new instance of the CommunicationManager class.
   */
  constructor() {
    // TODO: Wire this up to a UI element
    this.acceptingPayments = true;
  }

  /**
   * Select a single registration from the list of reg results.
   * @param {number} id - The ID from the list of reg search results to choose.
   * @return {*} - The selected registration.
   */
  setSelectedSearchResult(id) {
    if ((id < 0) || id > this.#regResults.length) {
      // TODO: Something more interesting?
      console.error(`Attempted to select out-of-bounds registration result ${id}.`);
      return;
    }

    this.#selectedReg = this.#regResults[id];
    return this.#selectedReg;
  }

  /**
   * Search for a registrant by name, populating the result if available.
   * @param {string} searchString - The string to search for.
   */
  startSearchForRegByName(searchString) {
    this.#searchString = searchString;

    // Start the search process, internally storing the promise and handling
    // the return value. Something like:
    // this.#searhPromise = this
    //   .whateverCommunicationThing.actuallyDoTheSearch(searchString)
    //   .then(handleSearchResults);

    // We then expect the LoadingState to add its own .then to the promise and
    // handle it appropriately.

    // In the meantime, mock it out
    const arr = [];
    const len = Math.floor(Math.random() * (4));
    for (let i = 0; i < len; i++) {
      arr.push(this.#tempGetRandomReg());
    }

    this.#searchPromise = new Promise((resolve) => setTimeout(resolve, 500))
      .then(() => arr) // The mock one!
      .then(this.handleSearchResults.bind(this)); // The real one!
  }

  /**
   * Mark a registratnt as paid.
   * @param {*} reg - The registrant to mark as paid.
   */
  async markRegistrantAsPaid(reg) {
    // TODO: Do it!
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  /**
   * Handle the results from a search.
   * @param {*} results - The results.
   * @return {*[]} - The array of results.
   */
  handleSearchResults(results) {
    // TODO: Assumes an array, who knows what we get back from the API though.
    // TODO: Whatever massaging necessary from the real API.
    this.#regResults = results;

    if (results.length === 1) {
      this.setSelectedSearchResult(0);
    } else {
      this.#selectedReg = undefined;
    }

    return this.#regResults;
  }

  /**
   * Temp method to generate random values.
   * @return {string} Random string
   */
  #tempGetRandomReg() {
    const r = (l) => (Math.random().toString(36)+'00000000000000000').slice(2, l+2);
    return {
      preferredName: r(5),
      legalName: r(10),
      birthdate: '1994-05-22',
      amountDue: 50,
      badgeLine1: r(8),
      badgeLine2: r(20),
      sponsorLevel: 'Sponsor',
      regNumber: '12345678',
    };
  }
}
