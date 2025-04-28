import Contact from "../models/contacts";
import NotFound  from "../utils/errors";

const listContacts = async (owner, query) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = "name",
    sortOrder = "asc",
    type,
    isFavourite,
  } = query;

  const skip = (page - 1) * perPage;
  const filter = { owner };
  
  if (type) {
    filter.contactType = type;
  }
  
  if (isFavourite !== undefined) {
    filter.isFavourite = isFavourite === "true";
  }

  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  
  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const contacts = await Contact.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(perPage);

  return {
    data: contacts,
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };
};

const getContactById = async (contactId, owner) => {
  const contact = await Contact.findOne({ _id: contactId, owner });
  if (!contact) {
    throw new NotFound("Contact not found");
  }
  return contact;
};

const addContact = async (body, owner) => {
  return await Contact.create({ ...body, owner });
};

const updateContact = async (contactId, body, owner) => {
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, owner },
    body,
    { new: true }
  );
  if (!updatedContact) {
    throw new NotFound("Contact not found");
  }
  return updatedContact;
};

const removeContact = async (contactId, owner) => {
  const deletedContact = await Contact.findOneAndDelete({ _id: contactId, owner });
  if (!deletedContact) {
    throw new NotFound("Contact not found");
  }
  return deletedContact;
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
};