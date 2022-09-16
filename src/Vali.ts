import type { ErrorTypes } from './types';
import { CountableValue, FormFieldsValidationResults, FormValidations, NumericValue, RequireableValue } from './types';
import { createValidationResult } from './validationResult';
import { Validator } from './Validator';
import * as Validations from './validationFunctions';
import { mapValues } from './utils/mapValues';

export class Vali<
  Value,
  ContextType = null,
  ErrorType extends ErrorTypes = ErrorTypes,
  ChildrenVResults extends FormFieldsValidationResults<any, any> | null = null,
> extends Validator<Value, ContextType, ErrorType, ChildrenVResults> {
  protected addValueValidation<NewValueType extends Value, Args extends Array<unknown>, NewContextType>(
    validationFn: (value: NewValueType, context: NewContextType, ...args: Args) => boolean,
    error: ErrorType,
    ...args: Args
  ) {
    const validation = (value: NewValueType, context: ContextType & NewContextType) =>
      createValidationResult(validationFn(value, context, ...args), error, null);

    return new Vali<NewValueType, ContextType & NewContextType, ErrorType, ChildrenVResults>([
      ...this.validations,
      validation,
    ]);
  }

  public fields<Validations extends FormValidations<Value, ContextType>>(
    formValidations: Validations,
    error: ErrorType,
  ) {
    const validation = (form: Value, context: ContextType) => {
      const fieldsResult = mapValues(formValidations, (validatorFactory, fieldName) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const fieldValue = form[fieldName];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const fieldValidator = validatorFactory(new Vali());

        return fieldValidator.validate(fieldValue, context);
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const isValid = Object.values(fieldsResult).every(({ isValid }) => isValid);

      return createValidationResult(isValid, error, fieldsResult);
    };

    return new Vali<
      Value,
      ContextType,
      ErrorType,
      ChildrenVResults extends null
        ? FormFieldsValidationResults<Validations, ContextType>
        : ChildrenVResults & FormFieldsValidationResults<Validations, ContextType>
    >([
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ...this.validations,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      validation,
    ]);
  }

  fn(fn: (val: Value, context: ContextType) => boolean, error: ErrorType) {
    return this.addValueValidation(fn, error);
  }

  required(error: ErrorType) {
    return this.addValueValidation(
      (value: Extract<Value, RequireableValue>) => Validations.validateRequireness(value),
      error,
    );
  }

  minLength(min: number, message: ErrorType) {
    return this.addValueValidation(
      (value: Extract<Value, CountableValue>, context: ContextType, min: number) =>
        Validations.validateLength(value, { min }),
      message,
      min,
    );
  }

  maxLength(max: number, message: ErrorType) {
    return this.addValueValidation(
      (value: Extract<Value, CountableValue>, context: ContextType, max: number) =>
        Validations.validateLength(value, { max }),
      message,
      max,
    );
  }

  min(min: number, message: ErrorType) {
    return this.addValueValidation(
      (value: Extract<Value, NumericValue>, context: ContextType, min: number) =>
        Validations.validateRange(value, { min }),
      message,
      min,
    );
  }

  max(max: number, message: ErrorType) {
    return this.addValueValidation(
      (value: Extract<Value, NumericValue>, context: ContextType, max: number) =>
        Validations.validateRange(value, { max }),
      message,
      max,
    );
  }
}
