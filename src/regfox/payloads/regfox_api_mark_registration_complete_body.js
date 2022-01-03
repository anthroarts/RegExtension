
const buildMarkRegistrationCompleteBody = (transactionId, id) => {
  const COMPLETED_TRANSACTION_STATUS = 6; // https://help.regfox.com/en/articles/2343634-transaction-statuses-explained
  const COMPLETED_REGISTRATION_STATUS = 3; // https://help.regfox.com/en/articles/2343628-registration-statuses-explained

  return {
    'confirmation':
    {
      'send': false,
      'message': '',
    },
    'adjustRegistrants': [
      {
        'id': id,
        'newStatus': COMPLETED_REGISTRATION_STATUS,
      }],
    'cancelRegistrants': [],
    'transactionContext': transactionId,
    'adjustTransactions': [
      {
        'id': transactionId,
        'newStatus': COMPLETED_TRANSACTION_STATUS,
        'data':
        {
          'note': '',
        },
        'gatewayReference': '',
      }],
    'refundAmount': 0,
  };
};

export { buildMarkRegistrationCompleteBody };
