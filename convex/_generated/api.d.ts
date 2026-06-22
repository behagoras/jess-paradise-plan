/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as destIndex from "../destIndex.js";
import type * as fx from "../fx.js";
import type * as liteapi from "../liteapi.js";
import type * as travelpayouts from "../travelpayouts.js";
import type * as trips from "../trips.js";
import type * as viator from "../viator.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  destIndex: typeof destIndex;
  fx: typeof fx;
  liteapi: typeof liteapi;
  travelpayouts: typeof travelpayouts;
  trips: typeof trips;
  viator: typeof viator;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
