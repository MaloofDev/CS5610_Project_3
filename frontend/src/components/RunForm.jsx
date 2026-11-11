import { useEffect, useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { apiGet, apiPost, apiPut } from "../lib/api.js";
import TestResultsEditor from "./TestResultsEditor.jsx";

const STATUSES = ["passed", "failed", "cancelled"];
const TEXT_FIELDS = [
  ["repo", "Repository"],
  ["release", "Release"],
  ["branch", "Branch"],
];

// datetime-local inputs take "YYYY-MM-DDTHH:mm" in local time.
function toLocalInput(value) {
  const date = new Date(value ?? Date.now());
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function toForm(run = {}) {
  return {
    repo: run.repo ?? "",
    release: run.release ?? "",
    branch: run.branch ?? "",
    commitSha: run.commitSha ?? "",
    status: STATUSES.includes(run.status) ? run.status : "passed",
    startedAt: toLocalInput(run.startedAt),
    durationSec: String(run.durationSec ?? ""),
    tests: (Array.isArray(run.tests) ? run.tests : []).map((test) => ({
      suite: test.suite ?? "",
      name: test.name ?? "",
      status: test.status ?? "passed",
      durationMs: String(test.durationMs ?? 0),
      errorMessage: test.errorMessage ?? "",
    })),
  };
}

export default function RunForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const formId = useId();
  const [form, setForm] = useState(toForm);
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet(`/api/runs/${id}`)
      .then((run) => setForm(toForm(run)))
      .catch((err) => setError(err.message));
  }, [id]);

  const setField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  // Parsing stays in the browser; a bad paste leaves the form untouched.
  function fillFromJson() {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("expected an object");
      }
      setForm(toForm(parsed));
      setJsonError("");
    } catch (err) {
      setJsonError(`Invalid JSON: ${err.message}. Fix the JSON and try again.`);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const body = {
      ...form,
      startedAt: new Date(form.startedAt).toISOString(),
      durationSec: Number(form.durationSec),
      tests: form.tests.map((test) => ({
        ...test,
        durationMs: Number(test.durationMs),
      })),
    };
    try {
      const saved = id
        ? await apiPut(`/api/runs/${id}`, body)
        : await apiPost("/api/runs", body);
      navigate(`/runs/${saved._id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="mb-3">{id ? "Edit run" : "Log run"}</h1>

      {!id && (
        <Card body className="mb-4">
          <Form.Group controlId={`${formId}-json`}>
            <Form.Label>Paste a JSON run summary (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              className="font-monospace"
              value={json}
              onChange={(event) => setJson(event.target.value)}
            />
          </Form.Group>
          <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
            <Button
              variant="outline-secondary"
              onClick={fillFromJson}
              disabled={!json.trim()}
            >
              Fill form from JSON
            </Button>
            {jsonError && (
              <span className="text-danger" role="alert">
                {jsonError}
              </span>
            )}
          </div>
        </Card>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-3 mb-3">
          {TEXT_FIELDS.map(([name, label]) => (
            <Form.Group
              as={Col}
              md={4}
              key={name}
              controlId={`${formId}-${name}`}
            >
              <Form.Label>{label}</Form.Label>
              <Form.Control
                name={name}
                value={form[name]}
                onChange={setField}
                required
              />
            </Form.Group>
          ))}
        </Row>
        <Row className="g-3 mb-4">
          <Form.Group as={Col} md={3} controlId={`${formId}-commit`}>
            <Form.Label>Commit</Form.Label>
            <Form.Control
              name="commitSha"
              value={form.commitSha}
              onChange={setField}
              pattern="[a-fA-F0-9]{7,40}"
              title="7 to 40 hex characters"
              required
            />
          </Form.Group>
          <Form.Group as={Col} md={3} controlId={`${formId}-status`}>
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={form.status} onChange={setField}>
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} md={3} controlId={`${formId}-started`}>
            <Form.Label>Started at</Form.Label>
            <Form.Control
              type="datetime-local"
              name="startedAt"
              value={form.startedAt}
              onChange={setField}
              required
            />
          </Form.Group>
          <Form.Group as={Col} md={3} controlId={`${formId}-duration`}>
            <Form.Label>Duration (sec)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              name="durationSec"
              value={form.durationSec}
              onChange={setField}
              required
            />
          </Form.Group>
        </Row>

        <h2 className="h5">Tests</h2>
        <TestResultsEditor
          tests={form.tests}
          onChange={(tests) => setForm({ ...form, tests })}
        />

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
        <div className="d-flex gap-2 mt-4">
          <Button type="submit" variant="dark" disabled={saving}>
            Save run
          </Button>
          <Button
            as={Link}
            to={id ? `/runs/${id}` : "/runs"}
            variant="outline-secondary"
          >
            Cancel
          </Button>
        </div>
      </Form>
    </>
  );
}
