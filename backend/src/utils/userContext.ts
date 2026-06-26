import { AsyncLocalStorage } from "node:async_hooks";
import { TsUserMinimalDTO } from "../controllers/tsUserController.js";

type userContext = {
  salutation: string,
  name: string,
  id: number,
  accountType: string
}
export const userAls = new AsyncLocalStorage<userContext | null>()
export function getUserContext(){
  const c = userAls.getStore();
  if(c === undefined) {
    throw new Error('The user context getter must be call inside a async function that runs with the user context');
  }
  return c;
}
