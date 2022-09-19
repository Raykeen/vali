# Vali
Vali is a simple form validation library.

Example:
```ts
type FormType = {
  name: string;
  quantity: number;
  price: number | null;
  recipients: string[];
  description: string;
};

const validator = new Vali<FormType, FormType>().fields(
  {
    name: (v) => v.required('name is required'),
    quantity: (v) => v.min(1, 'minimum 1').max(10, 'maximum 10'),
    price: (v) => v.max(10000, 'too much'),
    recipients: (v) =>
      v
        .minLength(1, 'should be at least 1 recipient')
        .fn((recipients, context) => {
          return v.maxLength(context.quantity, '').validate(recipients, context).isValid;
        }, "recipients count shouldn't be more than quantity")
        .required('recipients required'),
  },
  'Invalid product form',
);

const validForm: FormType = {
  name: '',
  quantity: 2,
  price: null,
  recipients: ['Vladimir', 'Joseph'],
  description: 'blablabla',
};

const result = validator.validate(validForm, validForm);
/*
  {
    isValid: false,
    error: "Invalid product form",
    result: {
      name: { isValid: false, error: "name is required", result: null },
      quantity: { isValid: true, error: null, result: null },
      ...
    }
  }
 */
```

## Features
* Form validations
* Typescript support
* Validators composition
* Validations based on a context
* Synchronous