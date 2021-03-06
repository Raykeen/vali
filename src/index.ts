import type {
  CountableValue,
  ErrorTypes,
  Form,
  FormFieldsValidationResults,
  FormValidationsBase,
  IValidator,
  NumericValue,
  RequireableValue,
  ValidationFunctionAdapted,
  ValidationResult,
} from './types';
import { createValidationResult } from './validationResult';
import * as Validations from './validationFunctions';
import { ValidatorCacheManager } from './ValidatorCacheManager';
import { EasyString } from './utilityTypes';

export class Validator<
  Value = unknown,
  ErrorType extends ErrorTypes = string,
  VResult extends ValidationResult<ErrorType, any> = ValidationResult<ErrorType>,
  > implements IValidator<Value, ErrorType, VResult>
{
  #validations: ValidationFunctionAdapted<Value, VResult | ValidationResult<ErrorType>>[] = [];
  #context: unknown = null;
  #cache = new ValidatorCacheManager<unknown, unknown, VResult>();

  static required<ErrorType extends ErrorTypes>(error: ErrorType) {
    return new Validator<RequireableValue, EasyString<ErrorType>>().required(error as EasyString<ErrorType>);
  }

  required(error: ErrorType): Validator<Extract<Value, RequireableValue>, ErrorType> {
    return this.#addValidation(
      (value: Extract<Value, RequireableValue>) => Validations.validateRequireness(value),
      error,
    );
  }

  static fn<Value, ErrorType extends ErrorTypes>(fn: (val: Value) => boolean, error: ErrorType) {
    return new Validator<Value, EasyString<ErrorType>>().fn(fn, error as EasyString<ErrorType>);
  }

  fn<FnValue>(fn: (val: FnValue) => boolean, error: ErrorType): Validator<Extract<Value, FnValue>, ErrorType> {
    return this.#addValidation((value: Extract<Value, FnValue>) => fn(value), error);
  }

  static minLength<ErrorType extends ErrorTypes>(min: number, error: ErrorType) {
    return new Validator<CountableValue, EasyString<ErrorType>>().minLength(min, error as EasyString<ErrorType>);
  }

  minLength(min: number, message: ErrorType): Validator<Extract<Value, CountableValue>, ErrorType> {
    return this.#addValidation(
      (value: Extract<Value, CountableValue>, min: number) => Validations.validateLength(value, { min }),
      message,
      min,
    );
  }

  static maxLength<ErrorType extends ErrorTypes>(max: number, error: ErrorType) {
    return new Validator<CountableValue, EasyString<ErrorType>>().maxLength(max, error as EasyString<ErrorType>);
  }

  maxLength(max: number, message: ErrorType): Validator<Extract<Value, CountableValue>, ErrorType> {
    this.#addValidation(
      (value: Extract<Value, CountableValue>, max: number) => Validations.validateLength(value, { max }),
      message,
      max,
    );
    return this;
  }

  static min<ErrorType extends ErrorTypes>(min: number, error: ErrorType) {
    return new Validator<NumericValue, EasyString<ErrorType>>().min(min, error as EasyString<ErrorType>);
  }

  min(min: number, message: ErrorType): Validator<Extract<Value, NumericValue>, ErrorType> {
    this.#addValidation(
      (value: Extract<Value, NumericValue>, min: number) => Validations.validateRange(value, { min }),
      message,
      min,
    );
    return this;
  }

  static max<ErrorType extends ErrorTypes>(max: number, error: ErrorType) {
    return new Validator<NumericValue, EasyString<ErrorType>>().max(max, error as EasyString<ErrorType>);
  }

  max(max: number, message: ErrorType): Validator<Extract<Value, NumericValue>, ErrorType> {
    this.#addValidation(
      (value: Extract<Value, NumericValue>, max: number) => Validations.validateRange(value, { max }),
      message,
      max,
    );
    return this;
  }

  static form<FormValidations extends FormValidationsBase, ErrorType extends ErrorTypes>(
    formValidations: FormValidations,
    error: ErrorType,
  ) {
    return new Validator<Form<FormValidations>, EasyString<ErrorType>>().form(formValidations, error as EasyString<ErrorType>);
  }

  form<FormValidations extends FormValidationsBase>(formValidations: FormValidations, error: ErrorType) {
    type ActualFormType = Form<FormValidations>;
    type ActualFormValidationResult = ValidationResult<ErrorType, FormFieldsValidationResults<FormValidations>>;

    (this as unknown as Validator<ActualFormType, ErrorType, ActualFormValidationResult>).#validations.push(
      (form: ActualFormType) => {
        const fieldsResult = Object.entries(formValidations).reduce((fieldsResult, [fieldName, fieldValidator]) => {
          const fieldValue = form[fieldName];

          const fieldResult = fieldValidator.validate(fieldValue, this.#context);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          fieldsResult[fieldName] = fieldResult;

          return fieldsResult;
        }, {} as FormFieldsValidationResults<FormValidations>);

        const isValid = Object.values(fieldsResult).every(({ isValid }) => isValid);

        return createValidationResult(isValid, error, fieldsResult);
      },
    );

    return this as unknown as Validator<Extract<Value, ActualFormType>, ErrorType, ActualFormValidationResult>;
  }

  validate(value: Value, context: any = value): VResult {
    const cached: VResult | null = this.#cache.get(value, context);

    if (cached) return cached;

    this.#context = context;

    let lastFormResult: null | (VResult extends ValidationResult<any, infer FieldsResults> ? FieldsResults : null) =
      null;
    let validationResult: VResult | ValidationResult<ErrorType> | undefined;

    for (const validation of this.#validations) {
      validationResult = validation(value);

      if (validationResult.result) {
        lastFormResult = validationResult.result;
      }

      if (!validationResult.isValid) break;
    }

    this.#context = null;

    const result = createValidationResult(
      validationResult?.isValid ?? true,
      validationResult?.error ?? null,
      lastFormResult,
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.#cache.set(value, context, result);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return result;
  }

  #addValidation<NewValueType extends Value, Args extends Array<unknown>>(
    validationFn: (value: NewValueType, ...args: Args) => boolean,
    error: ErrorType,
    ...args: Args
  ) {
    this.#cache.clear();

    (this as unknown as Validator<NewValueType, ErrorType, VResult>).#validations.push((value: NewValueType) =>
      createValidationResult(validationFn(value, ...args), error, null),
    );

    return this as unknown as Validator<NewValueType, ErrorType, VResult>;
  }
}
