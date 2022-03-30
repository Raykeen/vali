type ValidationResult<ErrorType, ChildrenValidationResults extends FormValidationResults | null = null> =
  | {
      isValid: true;
      error: null;
      result: ChildrenValidationResults;
    }
  | {
      isValid: false;
      error: ErrorType;
      result: ChildrenValidationResults;
    };

type FormValidationResults = Record<string, ValidationResult<any, any>>;

interface ValidationFunctionAdapted<Value, Result extends ValidationResult<any, any>> {
  (value: Value): Result;
}

type FormValidationsBase = Record<string, Validator<any, ErrorTypes, ValidationResult<ErrorTypes, FormValidationResults | null>>>;

type ExtractValue<V> = V extends Validator<infer Value, any> ? Value : unknown;

type Form<FormValidations extends FormValidationsBase> = {
  [K in keyof FormValidations]: ExtractValue<FormValidations[K]>;
};

type FormFieldsValidationResults<FormValidations extends FormValidationsBase> = {
  [K in keyof FormValidations]: FormValidations[K] extends Validator<any, ErrorTypes, infer R> ? R : never;
}

type Nullable<T> = T | undefined | null;

type ErrorTypes = string | object | symbol | (() => string | object | symbol);

type RequireableValue = Nullable<object | string | number | null | undefined | Array<any>>;

type CountableValue = Nullable<string | object | null | undefined | Array<any>>;

type NumericValue = Nullable<string | number>;

type ArgSelector<T> = (context: any) => T;

const createValidationResult = <ChildrenValidationResult extends FormValidationResults | null, ErrorType>(
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

const hasMeaningfulValue = (value: RequireableValue): boolean =>
  (typeof value === 'number' && Number.isFinite(value)) ||
  (Array.isArray(value) && value.length > 0) ||
  (typeof value === 'string' && value.length > 0) ||
  (typeof value === 'object' && value && Object.keys(value).length > 0) ||
  false;

export class Validator<
  Value = unknown,
  ErrorType extends ErrorTypes = string,
  VResult extends ValidationResult<ErrorType, any> = ValidationResult<ErrorType>,
> {
  #validations: ValidationFunctionAdapted<Value, VResult | ValidationResult<ErrorType>>[] = [];
  #context: any = null;
  #cache: {
    value: any;
    context: any;
    result: VResult;
  } | null = null;

  constructor() {
    return this;
  }

  static required<ErrorType extends ErrorTypes>(error: ErrorType) {
    return new Validator<RequireableValue, ErrorType>().required(error);
  }

  required(error: ErrorType): Validator<Extract<Value, RequireableValue>, ErrorType> {
    return this.#addValidation((value: Extract<Value, RequireableValue>) => hasMeaningfulValue(value), error);
  }

  static fn<Value, ErrorType extends ErrorTypes>(fn: (val: Value) => boolean, error: ErrorType) {
    return new Validator<Value, ErrorType>().fn(fn, error);
  }

  fn<FnValue>(fn: (val: FnValue) => boolean, error: ErrorType): Validator<Extract<Value, FnValue>, ErrorType> {
    return this.#addValidation((value: Extract<Value, FnValue>) => fn(value), error);
  }

  static minLength<ErrorType extends ErrorTypes>(min: number, error: ErrorType) {
    return new Validator<CountableValue, ErrorType>().minLength(min, error);
  }

  minLength(min: number, message: ErrorType): Validator<Extract<Value, CountableValue>, ErrorType> {
    return this.#addValidation(
      (value: Extract<Value, CountableValue>, min: number) =>
        !hasMeaningfulValue(value) ||
        ('length' in value && value.length >= min) ||
        (typeof value === 'object' && value && Object.keys(value).length >= min),
      message,
      min,
    );
  }

  static maxLength<ErrorType extends ErrorTypes>(max: number, error: ErrorType) {
    return new Validator<CountableValue, ErrorType>().maxLength(max, error);
  }

  maxLength(min: number, message: ErrorType): Validator<Extract<Value, CountableValue>, ErrorType> {
    this.#addValidation(
      (value: Extract<Value, CountableValue>, min: number) =>
        !hasMeaningfulValue(value) ||
        ('length' in value && value.length >= min) ||
        (typeof value === 'object' && value && Object.keys(value).length >= min),
      message,
      min,
    );
    return this;
  }

  static min<ErrorType extends ErrorTypes>(min: number, error: ErrorType) {
    return new Validator<NumericValue, ErrorType>().min(min, error);
  }

  min(min: number, message: ErrorType): Validator<Extract<Value, NumericValue>, ErrorType> {
    this.#addValidation(
      (value: Extract<Value, NumericValue>, min: number) => {
        const numberVal = typeof value === 'string' ? Number.parseFloat(value) : value;

        if (typeof numberVal === 'number' && Number.isNaN(numberVal)) {
          return false;
        }

        if (!hasMeaningfulValue(numberVal)) {
          return true;
        }

        if (typeof numberVal !== 'number') {
          return false;
        }

        return numberVal >= min;
      },
      message,
      min,
    );
    return this;
  }

  static max<ErrorType extends ErrorTypes>(max: number, error: ErrorType) {
    return new Validator<NumericValue, ErrorType>().max(max, error);
  }

  max(max: number, message: ErrorType): Validator<Extract<Value, NumericValue>, ErrorType> {
    this.#addValidation(
      (value: Extract<Value, NumericValue>, max: number) => {
        const numberVal = typeof value === 'string' ? Number.parseFloat(value) : value;

        if (typeof numberVal === 'number' && Number.isNaN(numberVal)) {
          return false;
        }

        if (!hasMeaningfulValue(numberVal)) {
          return true;
        }

        if (typeof numberVal !== 'number') {
          return false;
        }

        return numberVal <= max;
      },
      message,
      max,
    );
    return this;
  }

  static form<FormValidations extends FormValidationsBase, ErrorType extends ErrorTypes>(
    formValidations: FormValidations,
    error: ErrorType,
  ) {
    return new Validator<Form<FormValidations>, ErrorType>().form(formValidations, error);
  }

  form<FormValidations extends FormValidationsBase>(formValidations: FormValidations, error: ErrorType) {
    type ActualFormType = Form<FormValidations>;
    type ActualFormValidationResult = ValidationResult<ErrorType, FormFieldsValidationResults<FormValidations>>;

    (this as unknown as Validator<ActualFormType, ErrorType, ActualFormValidationResult>).#validations.push(
      (form: ActualFormType) => {
        return Object.entries(formValidations).reduce((validationResult, [fieldName, fieldValidator]) => {
          const fieldValue = form[fieldName];

          const fieldResult = fieldValidator.validate(fieldValue, this.#context);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          validationResult.result[fieldName] = fieldResult;
          validationResult.isValid = validationResult.isValid && fieldResult.isValid;

          return validationResult;
        }, createValidationResult<FormFieldsValidationResults<FormValidations>, ErrorType>(true, error, {} as FormFieldsValidationResults<FormValidations>));
      },
    );

    return this as unknown as Validator<Extract<Value, ActualFormType>, ErrorType, ActualFormValidationResult>;
  }

  validate(value: Value, context: any = value): VResult {
    const cached: VResult | null = this.#getCache(value, context);

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
    this.#setCache(value, context, result);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return result;
  }

  #getCache(value: Value, context: any): VResult | null {
    if (this.#cache && this.#cache.value === value && this.#cache.context === context) {
      return this.#cache.result;
    } else {
      return null;
    }
  }

  #setCache(value: Value, context: any, result: VResult) {
    this.#cache = { value, context, result };
  }

  #clearCache() {
    this.#cache = null;
  }

  #addValidation<NewValueType extends Value, Args extends Array<unknown>>(
    validationFn: (value: NewValueType, ...args: Args) => boolean,
    error: ErrorType,
    ...args: Args
  ) {
    this.#clearCache();

    (this as unknown as Validator<NewValueType, ErrorType, VResult>).#validations.push((value: NewValueType) =>
      createValidationResult(validationFn(value, ...args), error, null),
    );

    return this as unknown as Validator<NewValueType, ErrorType, VResult>;
  }
}
