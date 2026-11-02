import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm.jsx";
import useUser from "../context/useUser.js";

export default function RegisterPage() {
  const { user, register } = useUser();
  const navigate = useNavigate();

  if (user) return <Navigate to="/runs" replace />;

  async function handleRegister(username, password) {
    await register(username, password);
    navigate("/runs", { replace: true });
  }

  return (
    <AuthForm
      title="Sign up"
      submitLabel="Sign up"
      onSubmit={handleRegister}
      showConfirmPassword
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    />
  );
}
