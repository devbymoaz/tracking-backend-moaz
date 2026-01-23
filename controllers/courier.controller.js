const {
  createCourier,
  getAllCouriers,
  getCourierById,
  updateCourier,
  deleteCourier,
} = require("../models/couriers");
const { ApiError } = require("../utils/ApiError");

const createCourierController = async (req, res, next) => {
  try {
    const { name } = req.body;
    const logo = req.file ? req.file.filename : null;
    if (!name) {
      return next(new ApiError(400, "Name is required"));
    }
    const courier = await createCourier(req.body, logo);
    return res.status(201).json({
      message: "Courier created successfully.",
      data: courier,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCouriersController = async (req, res, next) => {
  try {
    const couriers = await getAllCouriers();
    return res.status(200).json({
      message: "Couriers retrieved successfully.",
      data: couriers,
    });
  } catch (error) {
    next(error);
  }
};

const getCourierByIdController = async (req, res, next) => {
  try {
    const courier = await getCourierById(req.params.id);
    if (!courier) {
      return next(new ApiError(404, "Courier not found"));
    }
    return res.status(200).json({
      message: "Courier retrieved successfully.",
      data: courier,
    });
  } catch (error) {
    next(error);
  }
};

const updateCourierController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    console.log("Update request - ID:", id);
    console.log("Update request - Body:", req.body);
    console.log("Update request - File:", req.file);

    if (!id) {
      return next(new ApiError(400, "Courier ID is required"));
    }
    if (!name) {
      return next(new ApiError(400, "Name is required"));
    }

    // Check if courier exists first
    const existingCourier = await getCourierById(id);
    if (!existingCourier) {
      return next(new ApiError(404, "Courier not found"));
    }

    // Prepare update data
    const updateData = { name };

    // Handle logo update
    let newLogo = existingCourier.logo; // Keep existing logo by default
    if (req.file) {
      newLogo = req.file.filename; // Update with new logo
      updateData.logo = newLogo;
    }

    const updatedCourier = await updateCourier(id, updateData);

    return res.status(200).json({
      message: "Courier updated successfully.",
      data: {
        id: parseInt(id),
        name: updateData.name,
        logo: newLogo,
      },
    });
  } catch (error) {
    console.error("Update courier error:", error);
    next(error);
  }
};

const deleteCourierController = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new ApiError(400, "Courier ID is required"));
    }

    const deletedCourier = await deleteCourier(id);

    if (!deletedCourier) {
      return next(new ApiError(404, "Courier not found"));
    }

    return res.status(200).json({
      message: "Courier deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourierController,
  getAllCouriersController,
  getCourierByIdController,
  updateCourierController,
  deleteCourierController,
};
