import { AsyncLocalStorage } from "node:async_hooks";
export const userAls = new AsyncLocalStorage();
export function getUserContext() {
    const c = userAls.getStore();
    if (c === undefined) {
        throw new Error('The user context getter must be call inside a async function that runs with the user context');
    }
    return c;
}
