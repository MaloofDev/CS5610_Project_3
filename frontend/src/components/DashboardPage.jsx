import { useSearchParams } from "react-router-dom";
import { Alert, Button, ButtonGroup, Col, Row } from "react-bootstrap";
import { formatDuration, formatPercent } from "../lib/format.js";
import useApiGet from "../lib/useApiGet.js";
import DurationChart from "./DurationChart.jsx";
import EmptyState from "./EmptyState.jsx";
import FlakyTestsTable from "./FlakyTestsTable.jsx";
import PassRateChart from "./PassRateChart.jsx";
import RepoSelect from "./RepoSelect.jsx";
import StatCard from "./StatCard.jsx";

const RANGES = [
  ["7d", "7 days"],
  ["30d", "30 days"],
];

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: options, error: optionsError } = useApiGet("/api/runs/filters");
  const repos = options?.repos ?? [];
  const repo = searchParams.get("repo") || repos[0] || "";
  const range = searchParams.get("range") === "30d" ? "30d" : "7d";

  const { data, error, loading } = useApiGet(
    repo && `/api/dashboard?repo=${encodeURIComponent(repo)}&range=${range}`,
  );
  const choose = (changes) => setSearchParams({ repo, range, ...changes });

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <h1 className="mb-0 me-auto">Pipeline health</h1>
        {repos.length > 0 && (
          <RepoSelect
            repos={repos}
            value={repo}
            onChange={(next) => choose({ repo: next })}
          />
        )}
        <ButtonGroup aria-label="Time range">
          {RANGES.map(([value, label]) => (
            <Button
              key={value}
              variant="outline-dark"
              active={range === value}
              aria-pressed={range === value}
              onClick={() => choose({ range: value })}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {(optionsError || error) && (
        <Alert variant="danger">{(optionsError || error).message}</Alert>
      )}
      {options && !repos.length && (
        <EmptyState>
          <p className="mb-0">No runs yet. Log a run to see pipeline health.</p>
        </EmptyState>
      )}
      {loading && !data && <p role="status">Loading dashboard…</p>}

      {data && data.totalRuns === 0 && (
        <EmptyState>
          <p className="mb-0">
            No runs for {repo} in the last {range === "7d" ? "7" : "30"} days.
          </p>
        </EmptyState>
      )}
      {data?.totalRuns > 0 && (
        <>
          <Row xs={2} md={4} className="g-3 mb-4">
            {[
              [formatPercent(data.passRate), "pass rate"],
              [data.totalRuns, "runs"],
              [formatDuration(data.avgDuration), "avg duration"],
              [data.failedRuns, "failed runs"],
            ].map(([value, label]) => (
              <Col key={label}>
                <StatCard value={value} label={label} />
              </Col>
            ))}
          </Row>
          <Row xs={1} md={2} className="g-3 mb-4">
            <Col>
              <DurationChart daily={data.daily} />
            </Col>
            <Col>
              <PassRateChart daily={data.daily} />
            </Col>
          </Row>
          <h2 className="h5">Flakiest tests (5+ runs)</h2>
          <FlakyTestsTable tests={data.flakyTests} />
        </>
      )}
    </>
  );
}
