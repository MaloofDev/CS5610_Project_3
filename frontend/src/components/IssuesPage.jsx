import PlaceholderPage from "./PlaceholderPage.jsx";

export default function IssuesPage() {
  return (
      <>
        <section className="placeholder-page">
          <h1>Known Issues</h1>
          <button>+ New Issue</button>
        </section>

        <form id="searchForm" className="hstack gap-2 py-3" role="search">
          <input
              id="searchInput"
              className="form-control"
              type="search"
              placeholder="Search by Package Name"
              aria-label="Search"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </>

  // <PlaceholderPage
  //   title="Known issues"
  //   description="Search known issues by text and filter them by category, status, and affected release."
  // />
);
}
