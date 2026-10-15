// Form validation utility
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export function validateForm(values: Record<string, any>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(fieldName => {
    const value = values[fieldName];
    const rule = rules[fieldName];

    // Required validation
    if (rule.required) {
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        errors[fieldName] = `${fieldName.replace(/([A-Z])/g, ' $1').trim()} is required`;
        return;
      }
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors[fieldName] = `Must be at least ${rule.minLength} characters`;
      return;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors[fieldName] = `Must be at most ${rule.maxLength} characters`;
      return;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors[fieldName] = 'Invalid format';
      return;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[fieldName] = customError;
        return;
      }
    }
  });

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getInputClassName(hasError: boolean): string {
  return `input-field ${hasError ? 'border-red-500 focus:ring-red-500' : ''}`;
}
