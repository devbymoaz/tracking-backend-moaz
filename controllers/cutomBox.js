const {
  createCustomBox,
  getCustomBoxes,
  updateCustomBox,
  deleteCustomBox,
} = require("../models/customeBox");
const { ApiError } = require("../utils/ApiError");

const createCustomBoxController = async (req, res) => {
  try {
    const { userId, boxName, length, width, height, category } = req.body;

    if (!userId || !boxName || !length || !width || !height || !category) {
      throw new ApiError(
        400,
        "All fields are required: userId, boxName, length, width, height, category."
      );
    }

    const newBox = await createCustomBox(
      userId,
      boxName,
      length,
      width,
      height,
      category
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

const getCustomBoxesController = async (req, res) => {
  try {
    const { userId } = req.query; // Extract userId from query parameters

    if (!userId) {
      throw new ApiError(400, "User ID is required.");
    }

    const boxes = await getCustomBoxes(userId);
    res
      .status(200)
      .json({ message: "Custom boxes retrieved successfully", boxes });
  } catch (error) {
    console.error("Error retrieving custom boxes:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const updateCustomBoxController = async (req, res) => {
  try {
    const { boxId } = req.params;
    const { userId, boxName, length, width, height, category } = req.body;
    const updatedBox = await updateCustomBox(
      boxId,
      userId,
      boxName,
      length,
      width,
      height,
      category
    );

    res
      .status(200)
      .json({ message: "Custom box updated successfully", box: updatedBox });
  } catch (error) {
    console.error("Error updating custom box:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const deleteCustomBoxController = async (req, res) => {
  try {
    const { boxId } = req.params;
    const { userId } = req.query;
    if (!boxId || !userId) {
      throw new ApiError(400, "Box ID and User ID are required.");
    }

    const result = await deleteCustomBox(boxId, userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting custom box:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = {
  createCustomBoxController,
  getCustomBoxesController,
  updateCustomBoxController,
  deleteCustomBoxController,
};
