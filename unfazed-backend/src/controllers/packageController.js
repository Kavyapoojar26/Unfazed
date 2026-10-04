const Package = require("../models/Package");


const createPackage = async (req, res) => {
  try {
    const {
      name,
      description,
      sessionCount,
      price,
      currency,
      validityDays
    } = req.body;

    if (!name || sessionCount === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, session count and price are required"
      });
    }

    const therapistPackage = await Package.create({
      therapist: req.therapistId,
      name,
      description: description || "",
      sessionCount: Number(sessionCount),
      price: Number(price),
      currency: currency || "INR",
      validityDays: validityDays || 90
    });

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      package: therapistPackage
    });
  } catch (error) {
    console.error("Create package error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getPackages = async (req, res) => {
  try {
    const { activeOnly } = req.query;

    const query = {
      therapist: req.therapistId
    };

    if (activeOnly === "true") {
      query.isActive = true;
    }

    const packages = await Package.find(query).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      count: packages.length,
      packages
    });
  } catch (error) {
    console.error("Get packages error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const therapistPackage = await Package.findOne({
      _id: id,
      therapist: req.therapistId
    });

    if (!therapistPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    res.json({
      success: true,
      package: therapistPackage
    });
  } catch (error) {
    console.error("Get package error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      sessionCount,
      price,
      currency,
      validityDays,
      isActive
    } = req.body;

    const therapistPackage = await Package.findOne({
      _id: id,
      therapist: req.therapistId
    });

    if (!therapistPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    if (name !== undefined) {
      therapistPackage.name = name.trim();
    }

    if (description !== undefined) {
      therapistPackage.description = description;
    }

    if (sessionCount !== undefined) {
      therapistPackage.sessionCount = Number(sessionCount);
    }

    if (price !== undefined) {
      therapistPackage.price = Number(price);
    }

    if (currency !== undefined) {
      therapistPackage.currency = currency.toUpperCase();
    }

    if (validityDays !== undefined) {
      therapistPackage.validityDays = Number(validityDays);
    }

    if (isActive !== undefined) {
      therapistPackage.isActive = isActive;
    }

    await therapistPackage.save();

    res.json({
      success: true,
      message: "Package updated successfully",
      package: therapistPackage
    });
  } catch (error) {
    console.error("Update package error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage
};