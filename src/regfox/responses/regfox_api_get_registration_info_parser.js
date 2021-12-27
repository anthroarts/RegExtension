
/**
 * Brings some of the "dynamic" data objects and places them directly on the main response.
 *
 * So instead of
 * {
 *  id: 1234
 *  data: [{
 *    path: "dateOfBirth"
 *    value: "2022-02-02"
 *  }]
 * }
 *
 * We get
 * {
 *  id: 1234,
 *  dataOfBirth: "2022-02-02"
 * }
 *
 * @param {*} rawResponse see below
 * @return {*} The object and the raw response
 */
const parseRegfoxGetRegistrationResponse = (rawResponse) => {
  const dataObject = rawResponse?.data?.reduce((acc, i) => {
    if (!i.value) {
      return acc;
    }
    return { [i.path]: i.value, ...acc };
  }, {});
  return { ...dataObject, ...rawResponse };
};

export { parseRegfoxGetRegistrationResponse };

// The raw response looks something like the below:
/* {
  "code":
  "error":
  "data": {
    "id":
    "organizationId":
    "accountId":
    "accountName":
    "accountContact":
    "accountEmail":
    "accountPhone":
    "accountSubdomain":
    "formId":
    "formProduct":
    "formName":
    "formAccRef":
    "formStatus":
    "currency":
    "gatewayId":
    "gatewayLabel":
    "gatewayType":
    "publishedPath":
    "registrationId":
    "registrationEmail":
    "registrationEmailOptIn":
    "registrationToken":
    "registrationHash":
    "registrationAmount":
    "registrationAmount100x":
    "publishedVersionId":
    "registrationStatus":
    "registrationStatusString":
    "accountMask":
    "paymentMethod":
    "expMonth":
    "expYear":
    "expDate":
    "orderNumber":
    "clientIp":
    "transactionId":
    "gatewayReference":
    "transactionAmount":
    "transactionDeductible":
    "transactionNetAmount":
    "transactionFeeAmount":
    "firstName":
    "lastName":
    "name":
    "address": {
      "street1":
      "city":
      "state":
      "postalCode":
      "country":
    },
    "billingName":
    "billingFirstName":
    "billingLastName":
    "billingEmail":
    "billingAddress": {
      "street1":
      "city":
      "state":
      "postalCode":
      "country":
    },
    "customerId":
    "orderContactId":
    "coordinates": {
      "location": {
        "lat":
        "lon":
      }
    },
    "hash":
    "email":
    "sourceType":
    "deviceName":
    "amount100x":
    "amountString":
    "status":
    "statusString":
    "reportingData": {
      "registrationOptionLabel":
      "registrationOptionAmount100x":
      "registrationOptionAmount":
    },
    "data": [
     {
        "type": "regOptions",
        "path": "registrationOptions",
        "label": "Membership Levels",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "regOption",
        "path": "registrationOptions.option1",
        "label": "Attending",
        "value":
        "number": 1,
        "amount": "65",
        "amount100x": 6500
      },
      {
        "type": "products",
        "path": "attendeeSwag",
        "label": "",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "textField",
        "path": "badgeLine1Text",
        "label": "Badge Line 1 Text",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "textField",
        "path": "badgeLine2Text",
        "label": "Badge Line 2 Text",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "birthDate",
        "path": "dateOfBirth",
        "label": "Date of Birth",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "nameField",
        "path": "legalName.first",
        "label": "First Name",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "nameField",
        "path": "legalName.last",
        "label": "Last Name",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "textField",
        "path": "preferredFirstName",
        "label": "Preferred first name",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "email",
        "path": "email",
        "label": "Email",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0,
        "optIn": "Yes"
      },
      {
        "type": "textField",
        "path": "address.postalCode",
        "label": "ZIP/Postal Code",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "textField",
        "path": "address.state",
        "label": "State",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "textField",
        "path": "address.street1",
        "label": "Street Address",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "textField",
        "path": "address.city",
        "label": "City",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "textField",
        "path": "address.country",
        "label": "Country",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "phone",
        "path": "phoneNumber",
        "label": "Phone Number",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "checkbox",
        "path": "haveReadAndAgree",
        "label": "I have read and agree to the Further Confusion COVID-19 Policy",
        "value":
        "number": 1,
        "amount": "0",
        "amount100x": 0
      },
      {
        "type": "checkbox",
        "path": "willBeFullyVaccinated",
        "label": "I will be fully vaccinated by the time of the convention and will provide proof of vaccination",
        "value":
        "number": 1,
        "amount": "0",
        "amount100x": 0
      },
      {
        "type": "checkbox",
        "path": "willWearMask",
        "label": "I will wear a mask",
        "value":
        "number": 1,
        "amount": "0",
        "amount100x": 0
      },
      {
        "type": "tos",
        "path": "terms",
        "label": "Code of Conduct",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      },
      {
        "type": "couponCode",
        "path": "couponCode",
        "label": "Coupon Code",
        "value":
        "number": 0,
        "amount": "",
        "amount100x": 0
      }
    ],
    "dump": ...
    "confirmationSent":
    "registrantCount":
    "subscriptionCount":
    "ticketCount":
    "transactionCount":
    "outstandingAmount100x":
    "outstandingAmountString":
    "bibNumber":
    "dateCompleted":
    "dateCreated":
    "dateUpdated":
  }
}
*/
