const router = require('express').Router();
const ticketListController = require('../controllers/ticket-list');

router.get('/ticket-list', ticketListController.getListTicket);

module.exports = router;