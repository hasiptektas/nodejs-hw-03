import { Contact } from '../models/contacts.js';
import { NotFound } from "../utils/errors.js";
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';

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
      const filter = { owner: req.user._id };
      
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
      const photo = req.file;
      let photoUrl;

      if (photo) {
        try {
          photoUrl = await saveFileToCloudinary(photo);
        } catch (error) {
          console.log(error);
          throw new Error('Failed to save photo, please try again later.');
        }
      }

      const newContact = await Contact.create({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        isFavourite: req.body.isFavourite,
        contactType: req.body.contactType,
        owner: req.user._id,
        photo: photoUrl
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
      const photo = req.file;
      let updateData = { ...req.body };

      if (photo) {
        try {
          const photoUrl = await saveFileToCloudinary(photo);
          updateData.photo = photoUrl;
        } catch (error) {
          console.log(error);
          throw new Error('Failed to save photo, please try again later.');
        }
      }

      const updatedContact = await Contact.findOneAndUpdate(
        { 
          _id: req.params.contactId,
          owner: req.user._id 
        },
        updateData,
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
  },

  patchContact: async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const photo = req.file;
      let photoUrl;

      if (photo) {
        if (process.env.ENABLE_CLOUDINARY === 'true') {
          photoUrl = await saveFileToCloudinary(photo);
        } else {
          photoUrl = await saveFileToUploadDir(photo);
        }
      }

      const updateData = {
        ...req.body,
        ...(photoUrl && { photo: photoUrl }) // photoUrl varsa ekle
      };

      const updatedContact = await Contact.findOneAndUpdate(
        { 
          _id: contactId,
          owner: req.user._id 
        },
        updateData,
        { new: true }
      );

      if (!updatedContact) throw new NotFound("Contact not found");

      res.json({
        status: 200,
        message: "Successfully patched contact!",
        data: updatedContact
      });
    } catch (error) {
      next(error);
    }
  }
};
export default contactsController;