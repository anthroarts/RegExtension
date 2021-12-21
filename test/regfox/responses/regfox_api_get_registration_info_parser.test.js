import { expect } from 'chai';

import { parseRegfoxGetRegistrationResponse } from '../../../src/regfox/responses/regfox_api_get_registration_info_parser.js';

describe('regfox_api_get_registration_info_parser', () => {
  describe('parseRegfoxGetRegistrationResponse', () => {
    it('doesn\'nt crash and burn on undefined input', () => {
      const body = parseRegfoxGetRegistrationResponse();
      expect(body).to.deep.equal({});
    });

    it('doesn\'nt crash and burn on empty input', () => {
      const body = parseRegfoxGetRegistrationResponse({});
      expect(body).to.deep.equal({});
    });

    it('parses out some data', () => {
      const body = parseRegfoxGetRegistrationResponse({
        id: 1234, data: [{
          "type": "regOptions",
          "path": "registrationOptions",
          "label": "Membership Levels",
          "value": "option1",
          "number": 0,
          "amount": "",
          "amount100x": 0
        }]
      });
      expect(body).to.deep.include({ id: 1234, registrationOptions: "option1" });
    });

    it('handles weird dots', () => {
      const body = parseRegfoxGetRegistrationResponse({
        id: 1234, data: [{
          "path": "legalName.first",
          "value": "Yakkub",
        },]
      });
      expect(body).to.deep.include({ id: 1234, "legalName.first": "Yakkub" });
    });

    it('keeps the data object just in case', () => {
      const body = parseRegfoxGetRegistrationResponse({
        id: 1234, data: [{
          "path": "no",
          "value": "yes",
        }]
      });
      expect(body).to.deep.include({ id: 1234, data: [{ "path": "no", "value": "yes", }] });
    });

    it('doesnt overwrite data when parsing', () => {
      const body = parseRegfoxGetRegistrationResponse({
        id: 1234, registrationOptions: 'standard', data: [{
          "path": "registrationOptions",
          "value": "option1",
        }]
      });
      expect(body).to.deep.include({ id: 1234, registrationOptions: "standard" });
    });

    it('gets the god damn birthdate like we wanted from the search api', () => {
      const body = parseRegfoxGetRegistrationResponse({
        id: 1234, registrationOptions: 'standard', data: [{
          "path": "dateOfBirth",
          "value": "1967-10-30",
        }]
      });
      expect(body).to.deep.include({ id: 1234, dateOfBirth: "1967-10-30" });
    });
  });
});