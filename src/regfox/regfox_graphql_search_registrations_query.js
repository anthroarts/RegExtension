// TODO It would probably be better to use a library to properly construct this schema.
const GRAPHQL_SEARCH_REGISTRATIONS_QUERY = `
query RegistrantsSearch($query: ElasticQueryInput) {
  response: registrantsSearch(query: $query) {
    success
    errors {
      messages
    }
    pagination {
      total
    }
    registrants {
      id
      registrationId
      customerId
      formId
      formName
      amount100x
      registrationAmount100x
      currency
      ticketCount
      transactionCount
      registrantCount
      status
      dateCreated
      datePaymentNext
      datePaymentDue
      name
      billingCompany
      billingAddress {
        city
        state
        postalCode
        country
      }
      address {
        street1
        street2
        city
        state
        postalCode
        country
      }
      accountMask
      paymentMethod
      outstandingAmount100x
      reportingData {
        registrationOptionLabel
      }
    }
  }
}
`;

/**
 * Returns a json object ready to be passed to Regfox that will search registrations for term.
 * 
 * @param {*} term name, email, etc
 */
const buildSearchRegistrationsBody = (term) => {
  return {
    "operationName": "RegistrantsSearch",
    "variables": {
      "query": {
        "productNames": [
          "regfox"
        ],
        "offset": 0,
        "length": 25,
        "search": {
          "fields": [
            "billingName",
            "email",
            "name",
            "registrationEmail",
            // Add whatever fields you want from to search on.
          ],
          "value": term
        },
        "sort": [
          {
            "field": "dateCreated",
            "order": "desc",
            "sortOrderForNulls": "_last"
          }
        ],
        "filters": [
          {
            "field": "formId",
            "value": [
              372652 // Magic value that means Further Confusion 2022 Registration.
              // You can find this by filtering registrations on "Page".
            ],
            "type": "match"
          },
          {
            "field": "status",
            "value": [
              "3" // Magic value that means "Completed" registration.
              // https://help.regfox.com/en/articles/2343628-registration-statuses-explained
              // You can find this by filtering registrations on "Status".
            ],
            "type": "match"
          },
        ]
      }
    },
    "query": GRAPHQL_SEARCH_REGISTRATIONS_QUERY
  };
}

module.exports = { buildSearchRegistrationsBody };

// All possible fields under registrants for graphql search and response
// See https://api.webconnex.com/v1/cp/report/regfox.com/registrant for examples
/*
id
organizationId
accountId
accountName
accountContact
accountEmail
accountPhone
accountSubdomain
formId
formProduct
formName
formAccRef
formStatus
currency
gatewayId
gatewayLabel
gatewayType
publishedPath
registrationId
registrationEmail
registrationEmailOptIn
registrationToken
registrationHash
registrationAmount
registrationAmount100x
publishedVersionId
registrationStatus
registrationStatusString
accountMask
paymentMethod
expMonth
expYear
expDate
orderNumber
clientIp
transactionId
gatewayReference
transactionAmount
transactionDeductible
transactionNetAmount
transactionFeeAmount
firstName
lastName
name
address {
  street1
  city
  state
  postalCode
  country
}
billingName
billingFirstName
billingLastName
billingEmail
billingAddress {
  street1
  city
  state
  postalCode
  country
}
customerId
orderContactId
coordinates {
  location {
    lat
    lon
  }
}
hash
email
sourceType
deviceName
amount100x
amountString
status
statusString
reportingData {
  registrationOptionLabel
  registrationOptionAmount100x
  registrationOptionAmount
}
*/