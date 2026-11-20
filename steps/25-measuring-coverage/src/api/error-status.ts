import type { ContentfulStatusCode } from "hono/utils/http-status";
import {
  DiscountError,
  EmptyCartError,
  InvalidPriceError,
  InvalidQuantityError,
  OutOfStockError,
  PaymentDeclinedError,
  ValidationError,
} from "../errors.ts";

const UNPROCESSABLE = 422;
const PAYMENT_REQUIRED = 402;
const CONFLICT = 409;
const SERVER_ERROR = 500;

// Which HTTP status goes with which kind of error. One table, so a new error is one new line.
const STATUS_BY_ERROR_CLASS: Array<[abstract new (...args: never[]) => Error, ContentfulStatusCode]> = [
  [ValidationError, UNPROCESSABLE],
  [InvalidQuantityError, UNPROCESSABLE],
  [InvalidPriceError, UNPROCESSABLE],
  [DiscountError, UNPROCESSABLE],
  [EmptyCartError, UNPROCESSABLE],
  [OutOfStockError, CONFLICT],
  [PaymentDeclinedError, PAYMENT_REQUIRED],
];

export interface ErrorAnswer {
  status: ContentfulStatusCode;
  message: string;
}

// Errors we expect tell the caller what went wrong. Anything else is a bug of ours:
// the caller only hears "something went wrong", so no private details leak out.
export function answerForError(error: Error): ErrorAnswer {
  const match = STATUS_BY_ERROR_CLASS.find(([errorClass]) => error instanceof errorClass);
  if (!match) {
    return { status: SERVER_ERROR, message: "something went wrong" };
  }
  return { status: match[1], message: error.message };
}
