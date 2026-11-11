import PropTypes from "prop-types";
import { Form } from "react-bootstrap";

export default function RepoSelect({ repos, value, onChange }) {
  return (
    <Form.Label className="d-flex align-items-center gap-2 mb-0">
      Repo
      <Form.Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {repos.map((repo) => (
          <option key={repo}>{repo}</option>
        ))}
      </Form.Select>
    </Form.Label>
  );
}

RepoSelect.propTypes = {
  repos: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
