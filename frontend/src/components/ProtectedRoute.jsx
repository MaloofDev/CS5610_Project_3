import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import useUser from "../context/useUser.js";

// Sends logged-out users to /login, remembering where they were headed.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) return <p>Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
