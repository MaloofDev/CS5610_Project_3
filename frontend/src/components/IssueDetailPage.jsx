import { useEffect, useState } from "react";
import { apiGet } from "../lib/api.js";
import { Link, useParams } from "react-router-dom";

export default function IssueDetailPage() {
  // fetch for single issue detail
  const [issue, setIssue] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    async function loadIssue() {
      try {
        const [issueData, updateData] = await Promise.all([
          apiGet(`/api/issues/${id}`),
          apiGet(`/api/updates?issueId=${id}`),
        ]);
        setIssue(issueData);
        setUpdates(updateData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadIssue();
  }, [id]);

  function formatDate(value) {
    return new Date(value)
      .toLocaleString("en-US", {
        weekday: "short",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/,/g, "");
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <section className="d-flex justify-content-between align-items-center">
        <h1>{issue.title}</h1>
        <div className="d-flex gap-2">
          <button id="create" type="submit" className="btn btn-primary">
            Edit
          </button>
          <button id="cancel" type="button" className="btn btn-secondary">
            Delete
          </button>
        </div>
      </section>
      <div className="row g-4 pt-3">
        <div className="col-12 col-md card border-2 p-3">
          <p className="text-lg-center-start fw-bold upper fs-4">Details</p>
          <dl className="row">
            <div className="col-6">
              <dt>Repository</dt>
              <dd>{issue.repo}</dd>
              <dt>Test/Job</dt>
              <dd>{issue.testOrJob}</dd>
            </div>
            <div className="col-6">
              <dt>Affected Releases</dt>
              <dd>{issue.affectedReleases}</dd>
              <dt>Category</dt>
              <dd>{issue.category}</dd>
            </div>
            <dt>Error</dt>
            <div className="px-3">
              <div className="col-12 card border-2 p-3 bg-secondary-subtle">
                <dd>{issue.errorSnippet}</dd>
              </div>
            </div>
            <dt className="pt-3">Fix Notes</dt>
            <dd>{issue.fixNotes}</dd>
          </dl>
        </div>
        <div className="col-12 col-md">
          <p className="text-lg-center-start fw-bold upper fs-4">
            Investigation Log
          </p>
          <div className="col-12 col-md card border-2 p-3 bg-secondary-subtle">
            <div className="px-3">
              <dt>Status Updates</dt>
              <form>
                <div className="col-12 card border-2 p-3"></div>
              </form>
              <div className="pt-3 d-flex justify-content-end">
                <button type="button" className="btn btn-dark">
                  Provide Update
                </button>
              </div>
            </div>
          </div>
          <ul>
            {updates.map((u) => (
              <li key={u._id}>
                <div className="col-12 col-md card p-3 border-0 bg-transparent">
                  <dl>
                    <dd>{formatDate(u.createdAt)}</dd>
                    <dd>{u.note}</dd>
                    <dd>{u.outcome}</dd>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
