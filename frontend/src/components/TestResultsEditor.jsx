import PropTypes from "prop-types";
import { Button, Form, Table } from "react-bootstrap";

const STATUSES = ["passed", "failed", "skipped"];
const NEW_TEST = {
  suite: "",
  name: "",
  status: "passed",
  durationMs: "0",
  errorMessage: "",
};

export default function TestResultsEditor({ tests, onChange }) {
  const update = (index, field, value) =>
    onChange(
      tests.map((test, i) =>
        i === index ? { ...test, [field]: value } : test,
      ),
    );
  const remove = (index) => onChange(tests.filter((_, i) => i !== index));

  return (
    <>
      {tests.length > 0 && (
        <div className="border rounded bg-body mb-2">
          <Table responsive size="sm" className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Suite</th>
                <th scope="col">Test name</th>
                <th scope="col">Status</th>
                <th scope="col">Duration (ms)</th>
                <th scope="col">Error message</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, index) => {
                const label = `test ${index + 1}`;
                const field = (name) => ({
                  size: "sm",
                  value: test[name],
                  onChange: (event) => update(index, name, event.target.value),
                });
                return (
                  <tr key={index}>
                    <td>
                      <Form.Control
                        {...field("suite")}
                        aria-label={`Suite for ${label}`}
                        required
                      />
                    </td>
                    <td>
                      <Form.Control
                        {...field("name")}
                        aria-label={`Name for ${label}`}
                        required
                      />
                    </td>
                    <td>
                      <Form.Select
                        {...field("status")}
                        aria-label={`Status for ${label}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        {...field("durationMs")}
                        type="number"
                        min="0"
                        aria-label={`Duration in ms for ${label}`}
                      />
                    </td>
                    <td>
                      <Form.Control
                        {...field("errorMessage")}
                        disabled={test.status !== "failed"}
                        aria-label={`Error message for ${label}`}
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => remove(index)}
                        aria-label={`Remove ${label}`}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => onChange([...tests, NEW_TEST])}
      >
        + Add test
      </Button>
    </>
  );
}

TestResultsEditor.propTypes = {
  tests: PropTypes.arrayOf(
    PropTypes.shape({
      suite: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      durationMs: PropTypes.string.isRequired,
      errorMessage: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};
