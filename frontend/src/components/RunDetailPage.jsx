import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Modal, Table } from "react-bootstrap";
import { apiDelete } from "../lib/api.js";
import { formatDateTime, formatDuration, formatMs } from "../lib/format.js";
import useApiGet from "../lib/useApiGet.js";
import StatusChip from "./StatusChip.jsx";
import "./RunDetailPage.css";

const STATUS_ORDER = { failed: 0, skipped: 1, passed: 2 };

export default function RunDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: run, error, loading } = useApiGet(`/api/runs/${id}`);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (loading) return <p role="status">Loading run…</p>;
  if (error) {
    return (
      <>
        <Alert variant="danger">{error.message}</Alert>
        <Link to="/runs">Back to Runs</Link>
      </>
    );
  }

  const tests = [...run.tests].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );
  const count = (status) =>
    run.tests.filter((test) => test.status === status).length;

  async function handleDelete() {
    try {
      await apiDelete(`/api/runs/${id}`);
      navigate("/runs");
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div className="d-flex align-items-center gap-3">
          <h1 className="mb-0">
            {run.repo} · {run.release}
          </h1>
          <StatusChip status={run.status} />
        </div>
        <div className="d-flex gap-2">
          <Button as={Link} to={`/runs/${id}/edit`} variant="outline-secondary">
            Edit
          </Button>
          <Button variant="outline-danger" onClick={() => setConfirming(true)}>
            Delete
          </Button>
        </div>
      </div>
      <p>
        Branch {run.branch} · commit <code>{run.commitSha}</code> · started{" "}
        {formatDateTime(run.startedAt)} · {formatDuration(run.durationSec)}
      </p>
      <div className="d-flex gap-2 mb-3">
        {["failed", "passed", "skipped"].map((status) => (
          <StatusChip key={status} status={status}>
            {count(status)} {status}
          </StatusChip>
        ))}
      </div>

      {tests.length ? (
        <div className="border rounded bg-body shadow-sm">
          <Table responsive className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Status</th>
                <th scope="col">Suite</th>
                <th scope="col">Test</th>
                <th scope="col">Duration</th>
                <th scope="col">Error message</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, index) => (
                <tr key={index}>
                  <td>
                    <StatusChip status={test.status} />
                  </td>
                  <td className="text-nowrap">{test.suite}</td>
                  <td className="text-nowrap">{test.name}</td>
                  <td>{formatMs(test.durationMs)}</td>
                  <td>
                    {test.errorMessage && (
                      <pre className="run-error bg-danger-subtle text-danger-emphasis rounded mb-0">
                        {test.errorMessage}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <p>This run has no test results.</p>
      )}

      <Modal show={confirming} onHide={() => setConfirming(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete this run?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            It will be removed from history, the dashboard, and release views.
          </p>
          {deleteError && (
            <Alert variant="danger" className="mt-3 mb-0">
              {deleteError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            Delete run
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => setConfirming(false)}
            autoFocus
          >
            Keep run
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
