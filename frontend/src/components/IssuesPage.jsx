import { useEffect, useState } from "react";
import { apiGet } from "../lib/api.js";
import { Link } from "react-router-dom";

export default function IssuesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadIssues() {
      try {
        setData(await apiGet("/api/issues"));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, []);

  const first = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const last = data ? first + data.issues.length - 1 : 0;

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
          >
            <div className="col-12 col-lg-5">
              <label className="form-label">Search</label>
              <div className="input-group">
                <input
                  id="searchInput"
                  className="form-control"
                  type="search"
                  placeholder="Search by Package Name"
                  aria-label="Search"
                />
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4 col-lg">
              <label className="form-label">Category</label>
              <select className="form-select w-auto">
                <option value="">Category</option>
              </select>
            </div>

            <div className="col-12 col-md-4 col-lg">
              <label className="form-label">Status</label>
              <select className="form-select w-auto">
                <option value="">Status</option>
              </select>
            </div>

            <div className="col-12 col-md-4 col-lg">
              <label className="form-label">Affected Release</label>
              <select className="form-select w-auto">
                <option value="">Affected Release</option>
              </select>
            </div>
          </form>
        </div>
      </section>
      <br></br>
      <div
        id="records"
        className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
      >
        {data && (
          <p>
            Showing {first}-{last} of {data.total}
          </p>
        )}
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
                  <td>{issue.title}</td>
                  <td>{issue.repo}</td>
                  <td>{issue.affectedReleases.join(",")}</td>
                  <td>{issue.testOrJob}</td>
                  <td>{issue.category}</td>
                  <td>{issue.status}</td>
                  <td>{issue.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
