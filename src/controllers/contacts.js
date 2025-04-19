import * as contactsService from '../services/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const getContacts = async (req, res, next) => {
  const contacts = await contactsService.getAllContacts();
  res.json({
    status: 200,
    message: "Successfully retrieved contacts",
    data: contacts
  });
};

const getContact = async (req, res, next) => {
  const contact = await contactsService.getContactById(req.params.contactId);
  res.json({
    status: 200,
    message: "Successfully retrieved contact",
    data: contact
  });
};

const createContact = async (req, res, next) => {
  const newContact = await contactsService.createContact(req.body);
  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: newContact
  });
};

const updateContact = async (req, res, next) => {
  const updatedContact = await contactsService.updateContact(
    req.params.contactId,
    req.body
  );
  res.json({
    status: 200,
    message: "Successfully patched a contact!",
    data: updatedContact
  });
};

const deleteContact = async (req, res, next) => {
  await contactsService.deleteContact(req.params.contactId);
  res.status(204).end();
};

export default {
  getContacts: ctrlWrapper(getContacts),
  getContact: ctrlWrapper(getContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  deleteContact: ctrlWrapper(deleteContact)
};