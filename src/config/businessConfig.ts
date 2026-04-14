/**
 * Business Configuration
 * Update these values with your actual business information
 */

export const businessConfig = {
  // Contact Information
  contact: {
    phone: import.meta.env.VITE_BUSINESS_PHONE || '+44 7456272712', // TODO: Replace with actual phone number
    email: import.meta.env.VITE_BUSINESS_EMAIL || 'olajesu2005@gmail.com', // TODO: Replace with actual email
    address: {
      street: '20-22 Mary Street',
      city: 'Manchester',
      postcode: 'M3 1DZ',
      full: 'unit 3 20-22 Mary Street, Manchester, M3 1DZ'
    }
  },

  // Ordering Platforms
  ordering: {
    uberEats: {
      enabled: true,
      url: import.meta.env.VITE_UBER_EATS_URL || '', // TODO: Add your Uber Eats store URL
      label: 'Order on Uber Eats'
    },
    justEat: {
      enabled: true,
      url: import.meta.env.VITE_JUST_EAT_URL || '', // TODO: Add your Just Eat store URL
      label: 'Order on Just Eat'
    },
    directCall: {
      enabled: true,
      label: 'Call for Lower Prices',
      description: 'Call us directly for lower prices and free delivery from £30'
    }
  },

  // Business Information
  business: {
    name: 'Olajesu Kitchen',
    tagline: 'Authentic Nigerian Cuisine in Manchester',
    description: 'Premium meal prep and catering services featuring traditional Nigerian dishes',
    operatingHours: {
      // TODO: Update with actual operating hours
      monday: 'Closed', // e.g., '10:00 AM - 10:00 PM'
      tuesday: '10:00 AM - 10:00 PM',
      wednesday: '10:00 AM - 10:00 PM',
      thursday: '10:00 AM - 10:00 PM',
      friday: '10:00 AM - 11:00 PM',
      saturday: '10:00 AM - 11:00 PM',
      sunday: '12:00 PM - 9:00 PM'
    },
    delivery: {
      minimumOrder: 30,
      freeDeliveryThreshold: 30,
      area: 'Greater Manchester', // TODO: Specify delivery areas/postcodes
      description: 'Free delivery on orders from £30 within our delivery area'
    }
  },

  // Social Media (optional)
  social: {
    facebook: import.meta.env.VITE_FACEBOOK_URL || '',
    instagram: import.meta.env.VITE_INSTAGRAM_URL || '',
    googleBusiness: import.meta.env.VITE_GOOGLE_BUSINESS_URL || ''
  }
};

