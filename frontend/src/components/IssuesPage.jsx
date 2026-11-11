import PlaceholderPage from "./PlaceholderPage.jsx";

export default function IssuesPage() {
  return (
    <>
      <section className="d-flex justify-content-between align-items-center">
        <h1>Known Issues</h1>
        <button type="submit" className="btn btn-secondary">
          + New Issue
        </button>
      </section>
      <br></br>
      <section className="card border-2">
        <div className="card-body">
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
        <p>Loading records...(fix this)</p>
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
              <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>

    // <PlaceholderPage
    //   title="Known issues"
    //   description="Search known issues by text and filter them by category, status, and affected release."
    // />
  );
}
