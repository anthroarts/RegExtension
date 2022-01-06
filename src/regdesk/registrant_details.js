import { BadgeLabelBuilder } from './label_builder.js';

/**
 * Contains information relevant to a registration.
 */
export class RegistrantDetails {
  /**
   * Indicates whether this registrant has ever been checked in.
   */
  get hasBeenCheckedIn() {
    return this.checkinDate !== undefined;
  }

  /**
   * Indicates whether this registrant is under 18.
   */
  get isMinor() {
    return this.age < 18;
  }

  /**
   * Indicates whether the transaction was completed or not.
   */
  get isPaid() {
    return this.paymentStatus === 'COMPLETED';
  }

  /**
   * Initializes a new instance of the RegistrantDetails class
   * @param {object} o - The argument object
   * @param {string} o.preferredName - The registrant's preferred name.
   * @param {string} o.legalName - The registrant's legal name.
   * @param {string} o.birthdate - Birthday, in yyyy-MM-dd format.
   * @param {string} o.amountDue - The remaining amount due.
   * @param {string} o.badgeLine1 - The line 1 of the badge.
   * @param {string} o.badgeLine2 - The line 2 of the badge.
   * @param {string} o.sponsorLevel - The sponsorship level.
   * @param {string} o.badgeId - The registrant ID to use as the badge ID.
   * @param {string} o.conbookCount - The number of con books in the order.
   * @param {string} o.checkinDate - The check in date string.
   * @param {string} o.paymentStatus - The status string for the transaction.
   */
  constructor({
    preferredName,
    legalName,
    birthdate,
    amountDue,
    badgeLine1,
    badgeLine2,
    sponsorLevel,
    badgeId,
    conbookCount,
    checkinDate,
    paymentStatus,
  }) {
    this.preferredName = preferredName,
    this.legalName = legalName,
    this.birthdate = birthdate,
    this.amountDue = amountDue,
    this.badgeId = badgeId,
    this.badgeLine1 = badgeLine1,
    this.badgeLine2 = badgeLine2,
    this.sponsorLevel = sponsorLevel,
    this.conbookCount = conbookCount,
    this.checkinDate = checkinDate,
    this.paymentStatus = paymentStatus.toUpperCase(),

    this.age = this.#getAge(birthdate);
    this.label = new BadgeLabelBuilder({
      badgeId: this.badgeId,
      isMinor: this.isMinor,
      level: this.sponsorLevel,
      line1: this.badgeLine1,
      line2: this.badgeLine2,
    });

    if (this.constructor === RegistrantDetails.constructor) {
      Object.freeze(this);
    }
  }

  /**
   * Copies one object to a new object.
   * @param {RegistrantDetails} registrantDetails - The object to copy
   * @return {RegistrantDetails} - A new instance with the same details of the original.
   */
  static copy(registrantDetails) {
    if (registrantDetails === undefined || registrantDetails === null) {
      return registrantDetails;
    }

    return new RegistrantDetails({
      amountDue: registrantDetails.amountDue,
      badgeId: registrantDetails.badgeId,
      badgeLine1: registrantDetails.badgeLine1,
      badgeLine2: registrantDetails.badgeLine2,
      birthdate: registrantDetails.birthdate,
      checkinDate: registrantDetails.checkinDate,
      conbookCount: registrantDetails.conbookCount,
      legalName: registrantDetails.legalName,
      paymentStatus: registrantDetails.paymentStatus,
      preferredName: registrantDetails.preferredName,
      sponsorLevel: registrantDetails.sponsorLevel,
    });
  }

  /**
   * Get an age in years between the birthdate and today.
   * @param {string} birthdate - The raw birthdate string, in YYYY-mm-dd format.
   * @param {Date} today - The 'today' value to use. Defaults to new Date().
   * @return {number} - Age in years between the birthdate and today.
   */
  #getAge(birthdate, today = new Date()) {
    if (!birthdate) {
      return undefined;
    }

    const yearInMs = 3.15576e+10;
    return Math.floor((today - new Date(birthdate).getTime()) / yearInMs);
  }
}
