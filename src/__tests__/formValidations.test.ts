import { Vali } from '../Vali';

describe('form validations', () => {
  it('validates required field', () => {
    type FormType = { foo: string | null; bar: Array<string> };

    const validator = new Vali<FormType>().fields(
      {
        foo: (V) => V.required('error Foo'),
        bar: (V) => V.maxLength(5, 'error Bar'),
      },
      'error',
    );

    expect(
      validator.validate({
        foo: null,
        bar: [],
      }).result.foo.isValid,
    ).toBe(false);
  });

  it('nested form validation', () => {
    type FooForm = {
      index: number;
      count: number;
    };

    type FormType = {
      foo: FooForm;
      bar: number[];
    };

    const fooValidator = new Vali<FooForm>().fields(
      {
        count: (v) => v.max(5, 'error C'),
      },
      'error a',
    );

    const validator = new Vali<FormType>().fields(
      {
        foo: () => fooValidator,
        bar: (v) => v.required('error B').maxLength(5, 'error B'),
      },
      'error',
    );

    expect(
      validator.validate({
        foo: {
          index: 1,
          count: 7,
        },
        bar: [],
      }).result.foo.result.count.isValid,
    ).toBe(false);
  });
});

describe('some real life forms', () => {
  describe('validates product', () => {
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
      name: 'glasses',
      quantity: 2,
      price: null,
      recipients: ['Vladimir', 'Joseph'],
      description: 'blablabla',
    };

    it('valid form', () => {
      const result = validator.validate(validForm, validForm);

      expect(result.isValid).toEqual(true);
      expect(result.error).toBeNull();
      expect(result.result.name.isValid).toEqual(true);
      expect(result.result.quantity.isValid).toEqual(true);
      expect(result.result.recipients.isValid).toEqual(true);
    });

    it('with invalid name', () => {
      const form = {
        ...validForm,
        name: '',
      };

      const result = validator.validate(form, form);

      expect(result.isValid).toEqual(false);
      expect(result.error).toEqual('Invalid product form');
      expect(result.result.name.isValid).toEqual(false);
      expect(result.result.name.error).toEqual('name is required');
    });

    it('with all invalid', () => {
      const form = {
        name: '',
        quantity: 11,
        price: 10001,
        recipients: new Array(12).fill('me'),
        description: 'blablabla',
      };

      const result = validator.validate(form, form);

      expect(result.isValid).toEqual(false);
      expect(result.error).toEqual('Invalid product form');
      expect(result.result.name.isValid).toEqual(false);
      expect(result.result.quantity.isValid).toEqual(false);
      expect(result.result.price.isValid).toEqual(false);
      expect(result.result.recipients.isValid).toEqual(false);
    });
  });
});
