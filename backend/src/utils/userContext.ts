import { AsyncLocalStorage } from "node:async_hooks";
import z from "zod";
import { contextSchema } from "../validators/contextValidators.js";

export type UserContext = z.infer<typeof contextSchema>
export const userAls = new AsyncLocalStorage<UserContext | null>()
export function getUserContext(){
  const c = userAls.getStore();
  if(c === undefined) {
    throw new Error('The user context getter must be call inside a async function that runs with the user context');
  }
  return c;
}
