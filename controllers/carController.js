const Car = require('../models/Car');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/cars');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

/**
 * Get all active cars (public endpoint)
 */
async function getActiveCars(req, res, next) {
    try {
        const cars = await Car.find({ is_active: true }).sort({ created_at: -1 });

        res.json({
            success: true,
            data: cars
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all cars (admin only)
 */
async function getAllCars(req, res, next) {
    try {
        const cars = await Car.find().sort({ created_at: -1 });

        res.json({
            success: true,
            data: cars
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create a new car (admin only)
 */
async function createCar(req, res, next) {
    try {
        const { name, base_100km_fare, extra_per_km, is_active } = req.body;

        // Image URL from uploaded file
        const image_url = req.file ? `/uploads/cars/${req.file.filename}` : '';

        if (!image_url) {
            return res.status(400).json({
                success: false,
                error: 'Car image is required'
            });
        }

        const car = new Car({
            name,
            image_url,
            base_100km_fare: parseFloat(base_100km_fare),
            extra_per_km: parseFloat(extra_per_km),
            is_active: is_active !== undefined ? is_active === 'true' : true
        });

        await car.save();

        res.status(201).json({
            success: true,
            data: car
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update a car (admin only)
 */
async function updateCar(req, res, next) {
    try {
        const { id } = req.params;
        const { name, base_100km_fare, extra_per_km, is_active } = req.body;

        const car = await Car.findById(id);

        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Update fields
        if (name) car.name = name;
        if (base_100km_fare) car.base_100km_fare = parseFloat(base_100km_fare);
        if (extra_per_km) car.extra_per_km = parseFloat(extra_per_km);
        if (is_active !== undefined) car.is_active = is_active === 'true';

        // Update image if new one uploaded
        if (req.file) {
            // Delete old image
            const oldImagePath = path.join(__dirname, '../public', car.image_url);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            car.image_url = `/uploads/cars/${req.file.filename}`;
        }

        await car.save();

        res.json({
            success: true,
            data: car
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a car (admin only)
 */
async function deleteCar(req, res, next) {
    try {
        const { id } = req.params;

        const car = await Car.findById(id);

        if (!car) {
            return res.status(404).json({
                success: false,
                error: 'Car not found'
            });
        }

        // Delete image file
        const imagePath = path.join(__dirname, '../public', car.image_url);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Car.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Car deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    upload,
    getActiveCars,
    getAllCars,
    createCar,
    updateCar,
    deleteCar
};
