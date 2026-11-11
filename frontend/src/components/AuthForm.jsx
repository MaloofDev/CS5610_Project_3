import { useId, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Button, Card, Form } from "react-bootstrap";
import "./AuthForm.css";

export default function AuthForm({
  title,
  submitLabel,
  onSubmit,
  showConfirmPassword = false,
  footer = null,
}) {
  const id = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (showConfirmPassword && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(username, password);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <Card className="auth-form">
      <Card.Body>
        <h1 className="auth-form__title">{title}</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId={`${id}-username`}>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId={`${id}-password`}>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              autoComplete={
                showConfirmPassword ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          {showConfirmPassword && (
            <Form.Group className="mb-3" controlId={`${id}-confirm`}>
              <Form.Label>Confirm password</Form.Label>
              <Form.Control
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </Form.Group>
          )}
          <Button type="submit" variant="dark" disabled={submitting}>
            {submitLabel}
          </Button>
          {error && (
            <Alert variant="danger" className="auth-form__error">
              {error}
            </Alert>
          )}
        </Form>
        {footer && <p className="auth-form__footer">{footer}</p>}
      </Card.Body>
    </Card>
  );
}

AuthForm.propTypes = {
  title: PropTypes.string.isRequired,
  submitLabel: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  showConfirmPassword: PropTypes.bool,
  footer: PropTypes.node,
};
