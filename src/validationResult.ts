import { FormFieldsValidationResults, ValidationResult } from './types';

export const createValidationResult = <ChildrenValidationResult extends FormFieldsValidationResults<any, any> | null, ErrorType>(
  isValid = true,
  error: ErrorType | null = null,
  result: ChildrenValidationResult,
): ValidationResult<ErrorType, ChildrenValidationResult> => {
  if (isValid) {
    return {
      isValid: true,
      error: null,
      result,
    };
  } else {
    return {
      isValid: false,
      error: error!,
      result,
    };
  }
};