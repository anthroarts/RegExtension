
/**
 * @return {*} a body object that can add a note to a registration.
 *
 * @param {string} message that should be seen as a note
 * @param {string} id of registration (**not** the RegistrationId)
 */
const buildAddNoteBody = (message, id) => {
  // I have no idea what these values mean and can't find any documentation on them.
  const noteType = 5;
  const createdBy = 144247; // Seems we can set this to any value?
  const visibility = 2;
  const editing = true;

  return { 'typeId': id, message, noteType, createdBy, visibility, editing };
};

export { buildAddNoteBody };
