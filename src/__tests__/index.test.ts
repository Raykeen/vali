import { Validator } from '../index';

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
