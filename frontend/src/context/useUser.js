import { useContext } from "react";
import UserContext from "./UserContext.js";

export default function useUser() {
  const value = useContext(UserContext);
  if (!value) {
    throw new Error("useUser() must be used inside <UserProvider>.");
  }
  return value;
}
