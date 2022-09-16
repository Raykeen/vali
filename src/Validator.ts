import type { ErrorTypes, IValidator, ValidationFunctionAdapted, ValidationResult } from './types';
import { createValidationResult } from './validationResult';
import { ValidatorCacheManager } from './ValidatorCacheManager';
import { FormFieldsValidationResults } from './types';

export class Validator<
  Value = unknown,
  ContextType = undefined,
  ErrorType extends ErrorTypes = string,
  ChildrenVResults extends FormFieldsValidationResults<any, any> | null = null,
> implements IValidator<Value, ContextType, ErrorType, ChildrenVResults>
{
  protected validations: ValidationFunctionAdapted<Value, ContextType, ValidationResult<ErrorType, ChildrenVResults | null>>[];
  #cache = new ValidatorCacheManager<unknown, unknown, ValidationResult<ErrorType, ChildrenVResults>>();

  constructor(validations: ValidationFunctionAdapted<Value, ContextType, ValidationResult<ErrorType, ChildrenVResults | null>>[] = []) {
    this.validations = validations;
  }

  validate(value: Value, ...rest: (ContextType extends null ? [undefined?] : [ContextType])): ValidationResult<ErrorType, ChildrenVResults> {
    const context = rest[0];
    const cached: ValidationResult<ErrorType, ChildrenVResults> | null = this.#cache.get(value, context);

    if (cached) return cached;

    let lastFormResult: null | (ValidationResult<ErrorType, ChildrenVResults> extends ValidationResult<any, infer FieldsResults> ? FieldsResults : null) =
      null;
    let validationResult: ValidationResult<ErrorType, ChildrenVResults | null> | undefined;

    for (const validation of this.validations) {
      validationResult = validation(value, context!);

      if (validationResult.result) {
        lastFormResult = validationResult.result;
      }

      if (!validationResult.isValid) break;
    }

    const result = createValidationResult(
      validationResult?.isValid ?? true,
      validationResult?.error ?? null,
      lastFormResult!,
    );

    this.#cache.set(value, context, result);

    return result;
  }
}
