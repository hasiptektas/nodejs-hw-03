import express from 'express';
import contactsController from '../controllers/contacts.js';

const router = express.Router();

router.get('/', contactsController.getContacts);
router.get('/:contactId', contactsController.getContact);
router.post('/', contactsController.createContact);
router.patch('/:contactId', contactsController.updateContact);
router.delete('/:contactId', contactsController.deleteContact);

export default router;