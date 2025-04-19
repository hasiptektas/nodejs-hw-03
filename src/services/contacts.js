import createError from 'http-errors';
import { ContactsCollection } from '../models/contacts.js';

export const getAllContacts = async () => {
  return await ContactsCollection.find().sort({ createdAt: -1 });
};

export const getContactById = async (id) => {
  const contact = await ContactsCollection.findById(id);
  if (!contact) {
    throw createError(404, 'Contact not found');
  }
  return contact;
};

export const createContact = async (contactData) => {
  const { name, phoneNumber, contactType } = contactData;
  
  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'Missing required fields');
  }

  const newContact = new ContactsCollection(contactData);
  return await newContact.save();
};

export const updateContact = async (id, updateData) => {
  const updatedContact = await ContactsCollection.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }
  
  return updatedContact;
};

export const deleteContact = async (id) => {
  const deletedContact = await ContactsCollection.findByIdAndDelete(id);
  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }
};