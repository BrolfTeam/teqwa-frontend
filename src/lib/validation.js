import { z } from 'zod';
import { format } from 'date-fns';

/**
 * Common validation schemas
 */
export const schemas = {
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  phone: z
    .string()
    .regex(
      /^(\+?[0-9\s-()]+)?$/,
      'Please enter a valid phone number'
    ),
  url: z.string().url('Please enter a valid URL'),
  date: z.string().or(z.date()).transform(val => {
    if (val instanceof Date) return val;
    return new Date(val);
  }),
  time: z.string().regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
    'Please enter a valid time (HH:MM)'
  ),
};

/**
 * Validation schemas for different forms
 */
export const formSchemas = {
  contact: z.object({
    name: schemas.name,
    email: schemas.email,
    phone: schemas.phone.optional(),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  }),

  registration: z
    .object({
      firstName: schemas.name,
      lastName: schemas.name,
      email: schemas.email,
      phone: schemas.phone.optional(),
      password: schemas.password,
      confirmPassword: z.string(),
      acceptTerms: z.boolean().refine(val => val === true, {
        message: 'You must accept the terms and conditions',
      }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),

  login: z.object({
    email: schemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  event: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    startDate: schemas.date,
    endDate: schemas.date,
    location: z.string().min(3, 'Location is required'),
    category: z.string().min(1, 'Category is required'),
    isRecurring: z.boolean().optional(),
    recurrencePattern: z.string().optional(),
    image: z.any().optional(),
  }),

  donation: z.object({
    amount: z.number().min(1, 'Amount must be greater than 0'),
    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter code')
      .transform(s => s.toUpperCase()),
    paymentMethod: z.enum(['card', 'paypal', 'bank_transfer', 'cash'], 'Invalid payment method'),
    name: schemas.name,
    email: schemas.email,
    phone: schemas.phone.optional(),
    isRecurring: z.boolean().optional(),
    // If recurring is true, frequency is required (e.g., monthly, weekly)
    frequency: z.string().optional(),
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  }).refine(data => {
    // When recurring is requested, frequency must be provided
    if (data.isRecurring) return Boolean(data.frequency && data.frequency.length > 0);
    return true;
  }, {
    message: 'Please select a frequency for recurring donations',
    path: ['frequency'],
  }),

  // Futsal booking form validation
  futsalBooking: z.object({
    slotId: z.string().min(1, 'Slot is required'),
    date: schemas.date,
    startTime: schemas.time,
    endTime: schemas.time,
    playerCount: z.number().min(1, 'At least one player is required').max(22, 'Player count exceeds limit'),
    contactName: schemas.name,
    contactEmail: schemas.email,
    contactPhone: schemas.phone.optional(),
    agreeToRules: z.boolean().refine(v => v === true, { message: 'You must agree to the rules' }),
  }).refine(data => {
    // Ensure startTime is before endTime (both strings in HH:MM or HH:MM:SS)
    const parseToMinutes = (t) => {
      const parts = t.split(':').map(Number);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;
      return h * 60 + m + s / 60;
    };
    try {
      return parseToMinutes(data.startTime) < parseToMinutes(data.endTime);
    } catch (e) {
      return false;
    }
  }, {
    message: 'End time must be later than start time',
    path: ['endTime'],
  }),
};

/**
 * Validate form data against a schema
 * @param {Object} schema - Zod schema to validate against
 * @param {Object} data - Data to validate
 * @returns {{ isValid: boolean, errors: Object, data: Object }}
 */
export const validateForm = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return { isValid: true, errors: {}, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors, data: null };
    }
    throw error;
  }
};

/**
 * Format form errors for display
 * @param {Object} errors - Error object from form validation
 * @returns {Array<{ field: string, message: string }>}
 */
export const formatFormErrors = (errors) => {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message,
  }));
};

/**
 * Parse form data with the given schema
 * @param {Object} schema - Zod schema
 * @param {FormData} formData - Form data from a form element
 * @returns {Object}
 */
export const parseFormData = (schema, formData) => {
  const data = {};

  // Convert FormData to a plain object
  for (const [key, value] of formData.entries()) {
    // Handle checkboxes and radio buttons
    if (value === 'on') {
      data[key] = true;
    } else if (value === 'off') {
      data[key] = false;
    } else if (!isNaN(Number(value)) && value !== '') {
      // Convert numeric strings to numbers
      data[key] = Number(value);
    } else if (key.endsWith('[]')) {
      // Handle multiple select
      const arrayKey = key.replace('[]', '');
      if (!data[arrayKey]) {
        data[arrayKey] = [value];
      } else {
        data[arrayKey].push(value);
      }
    } else {
      data[key] = value;
    }
  }

  // Parse with Zod schema
  return schema.parse(data);
};

// Export Zod for convenience
export { z };
