import { Contact } from '../models/contacts.js';
import { NotFound } from "../utils/errors.js";

export const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = "name",
      sortOrder = "asc",
      type,
      isFavourite,
    } = req.query;
    const skip = (page - 1) * perPage;

    const filter = { };
    
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

    res.json({
      status: 200,
      message: "Successfully found contacts!",
      data: {
        data: contacts,
        page: Number(page),
        perPage: Number(perPage),
        totalItems,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const contact = await Contact.findOne({ _id: contactId, owner });
    
    if (!contact) {
      throw new NotFound("Contact not found");
    }
    
    res.json({
      status: 200,
      message: "Successfully found contact!",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const add = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const newContact = await Contact.create({ ...req.body, owner });
    
    res.status(201).json({
      status: 201,
      message: "Successfully created contact!",
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner },
      req.body,
      { new: true }
    );
    
    if (!updatedContact) {
      throw new NotFound("Contact not found");
    }
    
    res.json({
      status: 200,
      message: "Successfully updated contact!",
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFavourite = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner },
      req.body,
      { new: true }
    );
    
    if (!updatedContact) {
      throw new NotFound("Contact not found");
    }
    
    res.json({
      status: 200,
      message: "Successfully updated favourite status!",
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
    const deletedContact = await Contact.findOneAndDelete({ _id: contactId, owner });
    
    if (!deletedContact) {
      throw new NotFound("Contact not found");
    }
    
    res.json({
      status: 200,
      message: "Successfully deleted contact!",
      data: deletedContact,
    });
  } catch (error) {
    next(error);
  }
};

// Alternatif olarak tüm controller'ları bir nesne içinde export etmek isterseniz:

const contactsController = {
  getAll,
  getById,
  add,
  updateById,
  updateFavourite,
  deleteById
};

export default contactsController;

