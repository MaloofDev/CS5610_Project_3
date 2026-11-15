import { useEffect, useState } from "react";
import { apiGet } from "../lib/api.js";
import { Link } from "react-router-dom";

export default function IssuesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter variables
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [release, setRelease] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadIssues() {
      const filters = new URLSearchParams({
        search,
        status,
        category,
        release,
        page,
      });
      try {
        setData(await apiGet(`/api/issues?${filters}`));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, [search, status, category, release, page]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchText);
    setPage(1);
  }

  const first = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const last = data ? first + data.issues.length - 1 : 0;

  function formatDate(value) {
    return new Date(value)
      .toLocaleString("en-US", {
        // weekday: "short",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/,/g, "");
  }

  return (
    <>
      <section className="d-flex justify-content-between align-items-center">
        <h1>Known Issues</h1>
        <Link to="/issues/new" className="btn btn-secondary">
          + New Issue
        </Link>
      </section>
      <br></br>
      <section className="card border-2">
        <div className="card-body">
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}
          <form
            id="searchForm"
            className="row g-3 align-items-end"
            role="search"
            onSubmit={handleSearch}
          >
            <div className="col-12 col-lg-5">
              <label className="form-label">Search</label>
              <div className="input-group">
                <input
                  id="searchInput"
                  className="form-control"
                  type="search"
                  placeholder="Search by title"
                  aria-label="Search"
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                />
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4 col-lg">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                value={category}
              >
                <option value="">All</option>
                <option value="flaky-test">Flaky Test</option>
                <option value="infra">Infra</option>
                <option value="timeout">Timeout</option>
                <option value="config">Config</option>
                <option value="dependency">Dependency</option>
              </select>
            </div>

            <div className="col-12 col-md-4 col-lg">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                value={status}
              >
                <option value="">All</option>
                <option value="investigating">Investigating</option>
                <option value="quarantined">Quarantined</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="col-12 col-md-4 col-lg">
              <label className="form-label">Affected Release</label>
              <select
                className="form-select"
                onChange={(e) => {
                  setRelease(e.target.value);
                  setPage(1);
                }}
                value={release}
              >
                <option value="">All</option>
                <option value="v0.7.9">v0.7.9</option>
                <option value="v0.8.3">v0.8.3</option>
                <option value="v1.8.4">v1.8.4</option>
                <option value="v1.9.0">v1.9.0</option>
                <option value="v2.3.7">v2.3.7</option>
                <option value="v2.4.2">v2.4.2</option>
                <option value="v3.1.0">v3.1.0</option>
              </select>
            </div>
          </form>
        </div>
      </section>
      <br></br>
      <div
        id="records"
        className="d-flex justify-content-between align-items-center my-3"
      >
        {data && (
          <p>
            Showing {first}-{last} of {data.total}
          </p>
        )}

        <div className="btn-group" role="group" aria-label="Issue-navigation">
          <button
            id="previous"
            type="button"
            className="btn btn-outline-primary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <button
            id="next"
            type="button"
            className="btn btn-outline-primary"
            disabled={!data || last >= data.total}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
      <section className="card border-2">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th scope="col-lg">Title</th>
                <th scope="col-lg">Repo</th>
                <th scope="col-lg">Release</th>
                <th scope="col-lg">Test/Job</th>
                <th scope="col-lg">Category</th>
                <th scope="col-lg">Status</th>
                <th scope="col-lg">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data?.issues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    <Link to={`/issues/${issue._id}`}>{issue.title}</Link>
                  </td>
                  <td>{issue.repo}</td>
                  <td>{issue.affectedReleases.join(",")}</td>
                  <td>{issue.testOrJob}</td>
                  <td>{issue.category}</td>
                  <td>{issue.status}</td>
                  <td>{formatDate(issue.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
