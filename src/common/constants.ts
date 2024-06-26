export const NATS_SERVICE = 'NATS_SERVICE';

export enum Orders {
  CREATE = 'CREATE_ORDER',
  FIND_ALL = 'FIND_ALL_ORDERS',
  FIND_ALL_BY_STATUS = 'FIND_ALL_ORDERS_BY_STATUS',
  FIND_ONE = 'FIND_ONE_ORDER',
  CHANGE_ORDER_STATUS = 'CHANGE_ORDER_STATUS',
}

export enum Products {
  VALIDATE_PRODUCTS = 'VALIDATE_PRODUCTS',
}

export enum Payments {
  CREATE_PAYMENT_SESSION = 'create.payment.session',
  PAYMENT_SUCCEEDED = 'payment.succeeded',
}
