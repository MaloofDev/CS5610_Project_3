import { Link, useSearchParams } from "react-router-dom";
import { Alert, Button } from "react-bootstrap";
import useApiGet from "../lib/useApiGet.js";
import EmptyState from "./EmptyState.jsx";
import RunFilters from "./RunFilters.jsx";
import RunTable from "./RunTable.jsx";

const FILTER_KEYS = ["repo", "release", "branch", "status", "from", "to"];

// Date inputs give local days; the API wants a startedAt range.
function runsPath(filters, page) {
  const params = new URLSearchParams({ page });
  const times = { from: "T00:00", to: "T23:59:59.999" };
  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;
    params.set(
      key,
      times[key] ? new Date(value + times[key]).toISOString() : value,
    );
  }
  return `/api/runs?${params}`;
}

export default function RunsPage() {
  // Filters live in the URL so Back from a run keeps them.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(
    FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ""]),
  );
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const { data, error, loading } = useApiGet(runsPath(filters, page));

  const filtered = Object.values(filters).some(Boolean);

  function update(nextFilters, nextPage = 1) {
    const params = Object.entries(nextFilters).filter(([, value]) => value);
    if (nextPage > 1) params.push(["page", nextPage]);
    setSearchParams(params);
  }

  const clearFilters = () => update({});
  const first = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const last = data ? first + data.runs.length - 1 : 0;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Runs</h1>
        <Button as={Link} to="/runs/new" variant="dark">
          + Log run
        </Button>
      </div>

      <RunFilters filters={filters} onChange={update} onClear={clearFilters} />

      {error && <Alert variant="danger">{error.message}</Alert>}
      {loading && !data && <p role="status">Loading runs…</p>}

      {data?.total > 0 && (
        <>
          <RunTable runs={data.runs} />
          <div className="d-flex justify-content-between align-items-center mt-3">
            <p className="mb-0">
              Showing {first}–{last} of {data.total}
            </p>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                disabled={page <= 1}
                onClick={() => update(filters, page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline-secondary"
                disabled={last >= data.total}
                onClick={() => update(filters, page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {data?.total === 0 &&
        (filtered ? (
          <EmptyState>
            <p>No runs match these filters.</p>
            <Button variant="outline-secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          </EmptyState>
        ) : (
          <EmptyState>
            <p>
              No runs yet. Log your first run to start tracking pipeline health.
            </p>
            <Button as={Link} to="/runs/new" variant="dark">
              Log run
            </Button>
          </EmptyState>
        ))}
    </>
  );
}
