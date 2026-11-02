import { Navigate } from "react-router-dom";
import useUser from "../context/useUser.js";

export default function HomeRedirect() {
  const { user, loading } = useUser();

  if (loading) return <p>Loading…</p>;
  return <Navigate to={user ? "/runs" : "/login"} replace />;
}
