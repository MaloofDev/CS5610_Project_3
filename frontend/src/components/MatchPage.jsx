import { useState } from "react";
import { Link } from "react-router-dom";

export default function MatchPage() {
  const [errorText, setErrorText] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  async function fetchMatches(e) {
    e.preventDefault();
    setError("");
    const params = new URLSearchParams({ text: errorText });
    const res = await fetch(`api/issues/match?${params}`);
    const body = await res.json();
    if (!res.ok) return setError(body.error);
    setResults(body);
  }

  function clearSearch() {
    setErrorText("");
    setResults(null);
    setError("");
  }

  return (
    <>
      <section className="d-flex justify-content-between align-items-center">
        <h1>Match an Error</h1>
      </section>
      <div className="row g-4 pt-3">
        <div className="col-12 col-md card border-2  text-bg-secondary p-3">
          <form onSubmit={fetchMatches}>
            <label htmlFor="exampleFormControlTextarea1" className="form-label">
              Error Message from CI Log
            </label>
            <textarea
              name="errorText"
              className="form-control"
              rows="6"
              placeholder="Insert error message"
              id="searchInput"
              aria-label="Search"
              value={errorText}
              onChange={(e) => setErrorText(e.target.value)}
            ></textarea>
            <div className="d-flex flex-wrap pt-3 gap-2">
              <button
                id="create"
                type="submit"
                className="btn btn-outline-light"
              >
                Find Matches
              </button>

              <button
                id="cancel"
                type="button"
                className="btn btn-outline-light"
                onClick={clearSearch}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
        <div className="col-12 col-md">
          <p>Matches</p>
          <div id="matches" className="card p-1 py-4">
            {error && <p>{error}</p>}
            {results?.length > 0 ? (
              results.map((issue) => (
                <p key={issue._id} className="ps-2 mb-1">
                  <Link to={`/issues/${issue._id}`}>{issue.title}</Link>
                </p>
              ))
            ) : (
              <p className="ps-2">No Matches</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
