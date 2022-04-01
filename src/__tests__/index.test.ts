import { Validator } from '../index';

describe("some real life usages", () => {
  describe('validates product', () => {
      const validator = Validator.form({
        name: Validator.required("name is required"),
        quantity: Validator.min(1, "minimum 1").max(10, "maximum 10"),
        price: Validator.max(10000, "too much"),
        recipients: Validator.minLength(1, "should be at least 1 recipient").maxLength(5, "no more than 5 recipients")
      }, 'Invalid product form')

    const validForm = {
      name: "glasses",
      quantity: 2,
      price: null,
      recipients: ["Vladimir", "Joseph"],
      description: "blablabla"
    }

    it('valid form', () => {
        const result = validator.validate(validForm);

        expect(result.isValid).toEqual(true);
        expect(result.error).toBeNull();
        expect(result.result.name.isValid).toEqual(true);
        expect(result.result.quantity.isValid).toEqual(true);
        expect(result.result.recipients.isValid).toEqual(true);
    });

    it('with invalid name', () => {
      const form = {
        ...validForm,
        name: ""
      }

      const result = validator.validate(form);

      expect(result.isValid).toEqual(false);
      expect(result.error).toEqual('Invalid product form');
      expect(result.result.name.isValid).toEqual(false);
      expect(result.result.name.error).toEqual("name is required");
    });

    it('with all invalid', () => {
      const form = {
        name: "",
        quantity: 11,
        price: 10001,
        recipients: (new Array(11)).fill("me"),
        description: "blablabla"
      }

      const result = validator.validate(form);

      expect(result.isValid).toEqual(false);
      expect(result.error).toEqual('Invalid product form');
      expect(result.result.name.isValid).toEqual(false);
      expect(result.result.quantity.isValid).toEqual(false);
      expect(result.result.price.isValid).toEqual(false);
      expect(result.result.recipients.isValid).toEqual(false);
    });
  });
})

it('123', () => {
  const validator = Validator.form(
    {
      a: Validator.required('error A'),
      b: Validator.maxLength(5, 'error B'),
    },
    'error',
  );

  expect(
    validator.validate({
      a: null,
      b: [],
    }).result.a.isValid,
  ).toBe(false);
});

it('1234', () => {
  const avalidator = Validator.form(
    {
      c: Validator.max(5, 'error C'),
    },
    'error a',
  );
  const validator = Validator.form(
    {
      a: avalidator,
      b: Validator.required('error B').maxLength(5, 'error B'),
    },
    'error',
  );

  expect(
    validator.validate({
      a: {
        c: 7,
        f: 1,
      },
      b: [],
    }).result.a.result.c.isValid,
  ).toBe(false);
});
