import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm.jsx";
import useUser from "../context/useUser.js";

export default function LoginPage() {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Send the user back to the page that asked them to log in.
  const from = location.state?.from;
  const target = from ? `${from.pathname}${from.search ?? ""}` : "/runs";

  if (user) return <Navigate to={target} replace />;

  async function handleLogin(username, password) {
    await login(username, password);
    navigate(target, { replace: true });
  }

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      onSubmit={handleLogin}
      footer={
        <>
          No account yet? <Link to="/register">Sign up</Link>
        </>
      }
    />
  );
}
