import createStorageContext from './context-store';
import type { UserContext } from "../../../backend/src/utils/userContext";

export const {
  Provider: UserContextProvider,
  useStorage: useUserContext
} = createStorageContext<UserContext & {expires: Date} | null> (
  'user-context',
  null
)
