import { useSearchParams } from "react-router-dom";
import { Alert, Col, Row } from "react-bootstrap";
import useApiGet from "../lib/useApiGet.js";
import EmptyState from "./EmptyState.jsx";
import ReleaseCard from "./ReleaseCard.jsx";
import RepoSelect from "./RepoSelect.jsx";

export default function ReleasesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: options, error: optionsError } = useApiGet("/api/runs/filters");
  const repos = options?.repos ?? [];
  const repo = searchParams.get("repo") || repos[0] || "";

  const {
    data: releases,
    error,
    loading,
  } = useApiGet(repo && `/api/releases?repo=${encodeURIComponent(repo)}`);

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <h1 className="mb-0 me-auto">Releases</h1>
        {repos.length > 0 && (
          <RepoSelect
            repos={repos}
            value={repo}
            onChange={(next) => setSearchParams({ repo: next })}
          />
        )}
      </div>

      {(optionsError || error) && (
        <Alert variant="danger">{(optionsError || error).message}</Alert>
      )}
      {options && !repos.length && (
        <EmptyState>
          <p className="mb-0">
            No runs yet. Log a run to see its release here.
          </p>
        </EmptyState>
      )}
      {loading && !releases && <p role="status">Loading releases…</p>}

      {releases && (
        <Row xs={1} md={2} lg={3} className="g-3">
          {releases.map((release) => (
            <Col key={release.release}>
              <ReleaseCard repo={repo} {...release} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}
