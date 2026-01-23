const {
  createBrandedBoxes,
  getBrandedBoxes,
  deleteBrandedBox,
  updateBrandedBox,
} = require("../models/brandedBox");
const { ApiError } = require("../utils/ApiError");

const createBrandedBox = async (req, res) => {
  try {
    const { boxName, length, width, height, category, visibility } = req.body;

    if (!boxName || !length || !width || !height || !category || !visibility) {
      throw new ApiError(
        400,
        "All fields are required: userId, boxName, length, width, height."
      );
    }

    const newBox = await createBrandedBoxes(
      boxName,
      length,
      width,
      height,
      category,
      visibility
    );
    res
      .status(201)
      .json({ message: "Custom box created successfully", box: newBox });
  } catch (error) {
    console.error("Error creating custom box:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const getBrandedBoxesController = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      throw new ApiError(400, "User ID and role are required.");
    }

    const boxes = await getBrandedBoxes(userId, role);
    res
      .status(200)
      .json({ message: "Branded boxes retrieved successfully", boxes });
  } catch (error) {
    console.error("Error retrieving branded boxes:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};
const getSelectedBrandedBoxes = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      throw new ApiError(400, "User ID and role are required.");
    }

    const boxes = await getBrandedBoxes(userId, role);

    // Group boxes by category
    const groupedBoxes = boxes.reduce((acc, box) => {
      const category = box.category?.toLowerCase() || "uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(box);
      return acc;
    }, {});

    res.status(200).json({
      message: "Branded boxes retrieved successfully",
      boxes: groupedBoxes,
    });
  } catch (error) {
    console.error("Error retrieving branded boxes:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};
const updateBrandedBoxController = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, boxName, length, width, height, category, visibility } =
      req.body;

    if (
      !userId ||
      !boxName ||
      !length ||
      !width ||
      !height ||
      !category ||
      !visibility
    ) {
      throw new ApiError(400, "All fields are required for update.");
    }

    const updatedBox = await updateBrandedBox(
      id,
      userId,
      boxName,
      length,
      width,
      height,
      category,
      visibility
    );

    res
      .status(200)
      .json({ message: "Box updated successfully", box: updatedBox });
  } catch (error) {
    console.error("Error updating branded box:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Delete Branded Box
const deleteBrandedBoxController = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id || !userId) {
      throw new ApiError(400, "Box ID and user ID are required.");
    }

    const result = await deleteBrandedBox(id, userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting branded box:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
module.exports = {
  createBrandedBox,
  getBrandedBoxesController,
  getSelectedBrandedBoxes,
  updateBrandedBoxController,
  deleteBrandedBoxController,
};
