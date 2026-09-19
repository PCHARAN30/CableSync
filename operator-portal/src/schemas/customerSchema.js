import { z } from "zod";

/**
 * Zod schema for validating the Customer Form.
 * Ensures rigorous validation of:
 * - Phone numbers: Standard 10-digit Indian mobile numbers (allows optional +91 or leading 0)
 * - Monthly fee: Positive finite number greater than 0
 * - CAF Number: Required, trimmed, alphanumeric with standard separators
 * - Name: Required, trimmed, 2-100 characters
 * - Address, Area, PON: Optional trimmed strings with reasonable length limits
 */
export const customerFormSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(1, "Phone number is required")
    .refine(
      (val) => {
        // Strip non-digits
        const digits = val.replace(/\D/g, "");
        // Accept 10 digits directly, 12 digits if starting with 91, or 11 digits if starting with 0
        if (digits.length === 10) {
          return /^[6-9]\d{9}$/.test(digits);
        }
        if (digits.length === 12 && digits.startsWith("91")) {
          return /^[6-9]\d{9}$/.test(digits.slice(2));
        }
        if (digits.length === 11 && digits.startsWith("0")) {
          return /^[6-9]\d{9}$/.test(digits.slice(1));
        }
        return false;
      },
      {
        message: "Enter a valid 10-digit mobile number (e.g. 9876543210)",
      }
    ),

  cafNumber: z
    .string({ required_error: "CAF number is required" })
    .trim()
    .min(1, "CAF number is required")
    .max(50, "CAF number cannot exceed 50 characters")
    .regex(/^[A-Za-z0-9\-_/]+$/, {
      message: "CAF number can only contain letters, numbers, hyphens, and slashes",
    }),

  address: z
    .string()
    .trim()
    .max(250, "Address cannot exceed 250 characters")
    .optional()
    .or(z.literal("")),

  area: z
    .string()
    .trim()
    .max(100, "Area cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),

  pon: z
    .string()
    .trim()
    .max(50, "PON cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),

  monthlyFee: z
    .union([z.number(), z.string()], {
      required_error: "Monthly fee is required",
    })
    .refine(
      (val) => val !== "" && val !== null && val !== undefined,
      "Monthly fee is required"
    )
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isFinite(val), {
      message: "Monthly fee must be a valid number",
    })
    .refine((val) => val > 0, {
      message: "Monthly fee must be greater than ₹0",
    })
    .refine((val) => val <= 100000, {
      message: "Monthly fee cannot exceed ₹1,00,000",
    }),
});

/**
 * Normalizes customer form input values for API submission
 */
export function normalizeCustomerPayload(validatedData) {
  let cleanedPhone = validatedData.phone.replace(/\D/g, "");
  if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
    cleanedPhone = cleanedPhone.slice(2);
  } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
    cleanedPhone = cleanedPhone.slice(1);
  }

  return {
    ...validatedData,
    phone: cleanedPhone,
    monthlyFee: Number(validatedData.monthlyFee),
    name: validatedData.name.trim(),
    cafNumber: validatedData.cafNumber.trim(),
    address: (validatedData.address || "").trim(),
    area: (validatedData.area || "").trim(),
    pon: (validatedData.pon || "").trim(),
  };
}
