import { Vali } from '../Vali';

describe('value validations', () => {
  describe('string requirements', () => {
    const nameValidator = new Vali<string | null | undefined>().required('name is required');

    it('valid', () => {
      expect(nameValidator.validate('Alyx')).toEqual({
        isValid: true,
        error: null,
        result: null,
      });
    });

    it('invalid', () => {
      expect(nameValidator.validate(null)).toEqual({
        isValid: false,
        error: 'name is required',
        result: null,
      });

      expect(nameValidator.validate(undefined)).toEqual({
        isValid: false,
        error: 'name is required',
        result: null,
      });
    });
  });

  describe('array requirements', () => {
    const goodsValidator = new Vali<string[] | null | undefined>().required('goods are required');

    it('valid', () => {
      expect(goodsValidator.validate(['apple'])).toEqual({
        isValid: true,
        error: null,
        result: null,
      });
    });

    it('invalid', () => {
      expect(goodsValidator.validate(null)).toEqual({
        isValid: false,
        error: 'goods are required',
        result: null,
      });

      expect(goodsValidator.validate(undefined)).toEqual({
        isValid: false,
        error: 'goods are required',
        result: null,
      });

      expect(goodsValidator.validate([])).toEqual({
        isValid: false,
        error: 'goods are required',
        result: null,
      });
    });
  });

  describe('value length', () => {
    const nameValidator = new Vali<string | null>().maxLength(10, 'max 10').minLength(2, 'min 2');

    it('valid', () => {
      expect(nameValidator.validate('Li')).toEqual({
        isValid: true,
        error: null,
        result: null,
      });

      expect(nameValidator.validate(null)).toEqual({
        isValid: true,
        error: null,
        result: null,
      });

      expect(nameValidator.validate('')).toEqual({
        isValid: true,
        error: null,
        result: null,
      });
    });

    it('invalid', () => {
      expect(nameValidator.validate('Fluggegecheimen')).toEqual({
        isValid: false,
        error: 'max 10',
        result: null,
      });
      expect(nameValidator.validate('L')).toEqual({
        isValid: false,
        error: 'min 2',
        result: null,
      });
    });
  });

  describe('value min and max', () => {
    const countValidator = new Vali<number | null>().max(10, 'max 10').min(2, 'min 2');

    it('valid', () => {
      expect(countValidator.validate(2)).toEqual({
        isValid: true,
        error: null,
        result: null,
      });

      expect(countValidator.validate(10)).toEqual({
        isValid: true,
        error: null,
        result: null,
      });

      expect(countValidator.validate(null)).toEqual({
        isValid: true,
        error: null,
        result: null,
      });
    });

    it('invalid', () => {
      expect(countValidator.validate(11)).toEqual({
        isValid: false,
        error: 'max 10',
        result: null,
      });
      expect(countValidator.validate(1)).toEqual({
        isValid: false,
        error: 'min 2',
        result: null,
      });
    });
  });
});
