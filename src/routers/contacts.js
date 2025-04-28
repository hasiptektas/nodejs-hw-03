import express from "express";
import contactsController from "../controllers/contacts.js";
import validateBody from "../middlewares/validateBody.js";
import isValidId from "../middlewares/isValidId.js";
// Değiştirilecek kısım:
import { contactValidationSchemas as schemas } from "../models/contacts.js";
import ctrlWrapper from "../utils/ctrlWrapper.js";

const router = express.Router();

router.get("/", ctrlWrapper(contactsController.getAll));

router.get("/:contactId", isValidId, ctrlWrapper(contactsController.getById));

router.post(
  "/",
  validateBody(schemas.addSchema),
  ctrlWrapper(contactsController.add)
);

router.patch(
  "/:contactId/favourite",
  isValidId,
  validateBody(schemas.updateFavouriteSchema),
  ctrlWrapper(contactsController.updateFavourite)
);

router.patch(
  "/:contactId",
  isValidId,
  validateBody(schemas.updateSchema),
  ctrlWrapper(contactsController.updateById)
);

router.delete("/:contactId", isValidId, ctrlWrapper(contactsController.deleteById));

export default router;