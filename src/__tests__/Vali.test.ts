import { Vali } from '../Vali';

describe("some real life usages", () => {
  describe('validates product', () => {
      type FormType = {
        name: string,
        quantity: number,
        price: number | null,
        recipients: string[],
        description: string
      }

      const validator = new Vali<FormType, FormType>().fields({
        name: (v) => v.required("name is required"),
        quantity: (v) => v.min(1, "minimum 1").max(10, "maximum 10"),
        price: (v) => v.max(10000, "too much"),
        recipients: (v) => v.minLength(1, "should be at least 1 recipient").fn((recipients, context) => {
          return v.maxLength(context.quantity, "").validate(recipients, context).isValid
        }, "recipients count shouldn't be more than quantity")
      }, 'Invalid product form')

    const validForm: FormType = {
      name: "glasses",
      quantity: 2,
      price: null,
      recipients: ["Vladimir", "Joseph"],
      description: "blablabla"
    }

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
        name: ""
      }

      const result = validator.validate(form, form);

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
        recipients: (new Array(12)).fill("me"),
        description: "blablabla"
      }

      const result = validator.validate(form, form);

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
  const validator = new Vali<{ a: any, b: Array<any> }>().fields(
    {
      a: (V) => V.required('error A'),
      b: (V) => V.maxLength(5, 'error B'),
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
  const avalidator = new Vali<{ c: number, f: number }>().fields(
    {
      c: (v) => v.max(5, 'error C'),
    },
    'error a',
  );
  const validator = new Vali<{ a: { c: number, f: number }, b: number[] }>().fields(
    {
      a: () => avalidator,
      b: (v) => v.required('error B').maxLength(5, 'error B'),
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
