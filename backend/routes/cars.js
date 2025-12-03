const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { authenticateAdmin } = require('../middleware/auth');
const { carValidationRules, validate } = require('../middleware/validators');

// Public route - get active cars
router.get('/', carController.getActiveCars);

// Admin routes
router.get('/all', authenticateAdmin, carController.getAllCars);

router.post('/',
    authenticateAdmin,
    carController.upload.single('image'),
    carValidationRules,
    validate,
    carController.createCar
);

router.put('/:id',
    authenticateAdmin,
    carController.upload.single('image'),
    carController.updateCar
);

router.delete('/:id',
    authenticateAdmin,
    carController.deleteCar
);

module.exports = router;
