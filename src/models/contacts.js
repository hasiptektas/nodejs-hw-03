import mongoose from 'mongoose';
import Joi from 'joi';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: 3,
      maxlength: 20,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone is required"],
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      minlength: 3,
      maxlength: 20,
      lowercase: true,
      trim: true
    },
    contactType: {
      type: String,
      enum: ["work", "home", "personal"],
      default: "personal",
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    photo: { 
      type: String 
    },
  },
  { 
    versionKey: false, 
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Joi Validation Schemas
export const contactValidationSchemas = {
  add: Joi.object({
    name: Joi.string().min(3).max(20).required(),
    phoneNumber: Joi.string().min(3).max(20).required(),
    email: Joi.string().min(3).max(20).email().required(),
    contactType: Joi.string().valid("work", "home", "personal"),
    isFavourite: Joi.boolean(),
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(20),
    phoneNumber: Joi.string().min(3).max(20),
    email: Joi.string().min(3).max(20).email(),
    contactType: Joi.string().valid("work", "home", "personal"),
  }).min(1),

  updateFavourite: Joi.object({
    isFavourite: Joi.boolean().required(),
  })
};

// Model Methods
contactSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId });
};

contactSchema.methods.toResponse = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

// Create and export Model
export const Contact = mongoose.model('Contact', contactSchema);

// Optional: Type Definitions
/**
 * @typedef {Object} Contact
 * @property {string} name
 * @property {string} phone
 * @property {string} email
 * @property {'work'|'home'|'personal'} contactType
 * @property {boolean} isFavourite
 * @property {import('mongoose').ObjectId} owner
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */