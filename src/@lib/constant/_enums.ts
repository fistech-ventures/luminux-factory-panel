export const ENUM_PAYMENT_METHODS = ['cash', 'bKash', 'nagad', 'rocket', 'upay', 'bank'] as const;
export type ENUM_PAYMENT_METHODS = (typeof ENUM_PAYMENT_METHODS)[number];

export const ENUM_CUSTOMER_TYPES = ['B2B', 'B2C'] as const;
export type ENUM_CUSTOMER_TYPES = (typeof ENUM_CUSTOMER_TYPES)[number];

export const ENUM_TRANSACTION_TYPES = ['cashIn', 'cashOut'] as const;
export type ENUM_TRANSACTION_TYPES = (typeof ENUM_TRANSACTION_TYPES)[number];
