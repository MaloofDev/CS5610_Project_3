import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function IssueForm() {
  const { id } = useParams();
  const [issue, setIssue] = useState({
    title: "",
    repo: "",
    affectedReleases: "",
    testOrJob: "",
    category: "",
    status: "",
    errorSnippet: "",
    fixNotes: "",
  });

  const [error, setError] = useState("");
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    async function fetchIssue() {
      const res = await fetch(`/api/issues/${id}`);
      if (!res.ok) return setError("The issue could not be found.");

      const data = await res.json();
      setIssue({ ...data, affectedReleases: data.affectedReleases.join(", ") });
    }
    fetchIssue();
  }, [id]);

  async function submitForm(e) {
    e.preventDefault();
    const res = await fetch(id ? `/api/issues/${id}` : "/api/issues", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(issue),
    });
    if (!res.ok) return setError("The issue could not be saved.");

    const savedIssue = await res.json();
    navigate(`/issues/${savedIssue._id}`);
  }

  function handleChange(e) {
    setIssue({ ...issue, [e.target.name]: e.target.value });
  }

  return (
    <>
      <section className="d-flex justify-content-between align-items-center">
        <h1>{isEdit ? "Edit Issue" : "New Issue"}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
      </section>

      <section className="card border-2">
        <div className="card-body">
          <form
            id="packageForm"
            className="needs-validation"
            noValidate
            onSubmit={submitForm}
          >
            <div className="row py-2">
              <div className="col-4">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  name="title"
                  value={issue.title}
                  onChange={handleChange}
                  id="title"
                  className="form-control"
                  aria-label="Title"
                />
              </div>
            </div>
            <div className="row py-3">
              <div className="col">
                <label className="form-label">Repository</label>
                <input
                  type="text"
                  name="repo"
                  value={issue.repo}
                  onChange={handleChange}
                  id="repo"
                  className="form-control"
                  aria-label="Repository"
                />
              </div>
              <div className="col">
                <label className="form-label">Affected Releases</label>
                <input
                  type="text"
                  name="affectedReleases"
                  value={issue.affectedReleases}
                  onChange={handleChange}
                  id="affectedReleases"
                  className="form-control"
                  aria-label="Affected Releases"
                />
              </div>
            </div>
            <div className="row py-3">
              <div className="col">
                <label className="form-label">Test or Job</label>
                <input
                  type="text"
                  name="testOrJob"
                  value={issue.testOrJob}
                  onChange={handleChange}
                  id="testOrJob"
                  className="form-control"
                  aria-label="Test or Job"
                />
              </div>
              <div className="col">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  name="category"
                  value={issue.category}
                  onChange={handleChange}
                  id="category"
                  className="form-control"
                  aria-label="Category"
                />
              </div>
              <div className="col">
                <label className="form-label">Status</label>
                <input
                  type="text"
                  name="status"
                  value={issue.status}
                  onChange={handleChange}
                  id="status"
                  className="form-control"
                  aria-label="Status"
                />
              </div>
            </div>
            <div className="row">
              <div className="mb-3">
                <label
                  htmlFor="exampleFormControlTextarea1"
                  className="form-label"
                >
                  Error
                </label>
                <textarea
                  name="errorSnippet"
                  value={issue.errorSnippet}
                  onChange={handleChange}
                  id="errorSnippet"
                  className="form-control"
                  rows="3"
                ></textarea>
              </div>
              <div className="mb-3">
                <label
                  htmlFor="exampleFormControlTextarea1"
                  className="form-label"
                >
                  Fix Notes
                </label>
                <textarea
                  name="fixNotes"
                  value={issue.fixNotes}
                  onChange={handleChange}
                  id="fixNotes"
                  className="form-control"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button id="create" type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
