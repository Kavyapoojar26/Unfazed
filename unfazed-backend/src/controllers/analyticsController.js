const Booking = require("../models/Booking");
const Client = require("../models/Client");
const Payment = require("../models/Payment");

const getAnalyticsOverview = async (req, res) => {
  try {
    const therapistId = req.therapistId;

    const [
      totalClients,
      totalBookings,
      completedSessions,
      cancelledBookings,
      paidPayments
    ] = await Promise.all([
      Client.countDocuments({
        therapist: therapistId
      }),

      Booking.countDocuments({
        therapist: therapistId
      }),

      Booking.countDocuments({
        therapist: therapistId,
        status: "completed"
      }),

      Booking.countDocuments({
        therapist: therapistId,
        status: "cancelled"
      }),

      Payment.find({
        therapist: therapistId,
        status: "paid"
      }).select("amount")
    ]);

    const totalRevenue = paidPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );

    res.json({
      success: true,
      analytics: {
        totalClients,
        totalBookings,
        completedSessions,
        cancelledBookings,
        totalRevenue,
        currency: "INR"
      }
    });
  } catch (error) {
    console.error("Get analytics overview error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate analytics"
    });
  }
};

const getAdvancedAnalytics = async (req, res) => {
  try {
    const therapistId = req.therapistId;

    const [
      bookingStats,
      revenueByMonth,
      clientStats
    ] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            therapist: therapistId
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]),

      Payment.aggregate([
        {
          $match: {
            therapist: therapistId,
            status: "paid"
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$paidAt" },
              month: { $month: "$paidAt" }
            },
            revenue: { $sum: "$amount" },
            payments: { $sum: 1 }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1
          }
        }
      ]),

      Client.aggregate([
        {
          $match: {
            therapist: therapistId
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        bookingStats,
        revenueByMonth,
        clientStats
      }
    });
  } catch (error) {
    console.error("Get advanced analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate advanced analytics"
    });
  }
};

module.exports = {
  getAnalyticsOverview,
  getAdvancedAnalytics
};