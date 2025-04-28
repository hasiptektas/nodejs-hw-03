import { BadRequest } from '../utils/errors.js';
import mongoose from 'mongoose';

const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    next(new BadRequest("Invalid contact id"));
  }
  next();
};

export default isValidId;
