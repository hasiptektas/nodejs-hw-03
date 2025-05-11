import express from "express";
import contactsController from "../controllers/contacts.js";
import validateBody from "../middlewares/validateBody.js";
import isValidId from "../middlewares/isValidId.js";
// Değiştirilecek kısım:
import { contactValidationSchemas as schemas } from "../models/contacts.js";
import ctrlWrapper from "../utils/ctrlWrapper.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();
const jsonParser = express.json();

router.use(authenticate);

router.get("/", ctrlWrapper(contactsController.getAll));

router.get("/:contactId", isValidId, ctrlWrapper(contactsController.getById));

router.post(
  "/",
  jsonParser,
  upload.single('photo'),
  validateBody(schemas.add),
  ctrlWrapper(contactsController.add)
);

router.patch(
  "/:contactId/favourite",
  isValidId,
  validateBody(schemas.updateFavourite),
  ctrlWrapper(contactsController.updateFavourite)
);

router.patch(
  "/:contactId",
  jsonParser,
  upload.single('photo'),
  isValidId,
  validateBody(schemas.update),
  ctrlWrapper(contactsController.updateById)
);

router.delete("/:contactId", isValidId, ctrlWrapper(contactsController.deleteById));

export default router;