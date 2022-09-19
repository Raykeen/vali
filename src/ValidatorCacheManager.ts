interface ValidatorCache<TValue, TContext, TResult> {
  value: TValue;
  context: TContext;
  result: TResult;
}

export class ValidatorCacheManager<TValue, TContext, TResult> {
  #cache: ValidatorCache<TValue, TContext, TResult> | null = null;

  get(value: TValue, context: TContext): TResult | null {
    if (this.#cache && this.#cache.value === value && this.#cache.context === context) {
      return this.#cache.result;
    } else {
      return null;
    }
  }

  set(value: TValue, context: TContext, result: TResult) {
    this.#cache = { value, context, result };
  }

  clear() {
    this.#cache = null;
  }
}
