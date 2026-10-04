const PLANS = {
  starter: {
    name: "Starter",

    limits: {
      clients: 50,
      bookingsPerMonth: 100,
      packages: 5
    },

    features: {
      payments: true,
      invoices: true,
      clinicalNotes: true,
      basicAnalytics: true,
      advancedAnalytics: false,
      chat: false
    }
  },

  professional: {
    name: "Professional",

    limits: {
      clients: 250,
      bookingsPerMonth: 500,
      packages: 20
    },

    features: {
      payments: true,
      invoices: true,
      clinicalNotes: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      chat: true
    }
  },

  business: {
    name: "Business",

    limits: {
      clients: -1,
      bookingsPerMonth: -1,
      packages: -1
    },

    features: {
      payments: true,
      invoices: true,
      clinicalNotes: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      chat: true
    }
  }
};

module.exports = PLANS;