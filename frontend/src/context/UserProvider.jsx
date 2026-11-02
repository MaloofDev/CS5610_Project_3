import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import UserContext from "./UserContext.js";
import { apiGet, apiPost } from "../lib/api.js";

// Loads the current user once, then keeps it in sync after login, register, and logout.
export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/auth/me")
      .then((data) => active && setUser(data.user))
      // 401 means logged out.
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiPost("/api/auth/login", { username, password });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (username, password) => {
    const data = await apiPost("/api/auth/register", { username, password });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await apiPost("/api/auth/logout");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
