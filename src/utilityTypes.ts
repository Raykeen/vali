export type Nullable<T> = T | undefined | null;

export type EasyString<T> = T extends string ? string : T;