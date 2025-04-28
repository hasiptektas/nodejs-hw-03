import { Contact } from '../models/contacts.js';
import { NotFound } from "../utils/errors.js";

const contactsController = {
  getAll: async (req, res, next) => {
    try {
      const { 
        page = 1, 
        perPage = 10,
        sortBy = "name",
        sortOrder = "asc",
        type,
        isFavourite 
      } = req.query;
      
      const skip = (page - 1) * perPage;
      const filter = { owner: req.user._id }; // Sadece oturum açan kullanıcının contact'ları
      
      if (type) filter.contactType = type;
      if (isFavourite !== undefined) {
        filter.isFavourite = isFavourite === "true";
      }

      const [totalItems, contacts] = await Promise.all([
        Contact.countDocuments(filter),
        Contact.find(filter)
          .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(perPage)
      ]);

      res.json({
        status: 200,
        message: "Successfully found contacts!",
        data: {
          data: contacts,
          page: Number(page),
          perPage: Number(perPage),
          totalItems,
          totalPages: Math.ceil(totalItems / perPage),
          hasPreviousPage: page > 1,
          hasNextPage: page < Math.ceil(totalItems / perPage)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const contact = await Contact.findOne({
        _id: req.params.contactId,
        owner: req.user._id
      });
      
      if (!contact) throw new NotFound("Contact not found");
      
      res.json({
        status: 200,
        message: "Successfully found contact!",
        data: contact
      });
    } catch (error) {
      next(error);
    }
  },

  add: async (req, res, next) => {
    try {
      const newContact = await Contact.create({
        ...req.body,
        owner: req.user._id
      });
      
      res.status(201).json({
        status: 201,
        message: "Successfully created contact!",
        data: newContact
      });
    } catch (error) {
      next(error);
    }
  },

  updateById: async (req, res, next) => {
    try {
      const updatedContact = await Contact.findOneAndUpdate(
        { 
          _id: req.params.contactId,
          owner: req.user._id 
        },
        req.body,
        { new: true }
      );
      
      if (!updatedContact) throw new NotFound("Contact not found");
      
      res.json({
        status: 200,
        message: "Successfully updated contact!",
        data: updatedContact
      });
    } catch (error) {
      next(error);
    }
  },

  updateFavourite: async (req, res, next) => {
    try {
      const updatedContact = await Contact.findOneAndUpdate(
        { 
          _id: req.params.contactId,
          owner: req.user._id 
        },
        { isFavourite: req.body.isFavourite },
        { new: true }
      );
      
      if (!updatedContact) throw new NotFound("Contact not found");
      
      res.json({
        status: 200,
        message: "Successfully updated favourite status!",
        data: updatedContact
      });
    } catch (error) {
      next(error);
    }
  },

  deleteById: async (req, res, next) => {
    try {
      const deletedContact = await Contact.findOneAndDelete({
        _id: req.params.contactId,
        owner: req.user._id
      });
      
      if (!deletedContact) throw new NotFound("Contact not found");
      
      res.json({
        status: 200,
        message: "Successfully deleted contact!",
        data: deletedContact
      });
    } catch (error) {
      next(error);
    }
  }
};

export default contactsController;