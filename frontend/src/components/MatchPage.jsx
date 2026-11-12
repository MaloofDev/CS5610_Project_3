export default function MatchPage() {
  return (
    <>
      <section className="d-flex justify-content-between align-items-center">
        <h1>Match an Error</h1>
      </section>
      <div className="row g-4 pt-3">
        <div className="col-12 col-md card border-2  text-bg-secondary p-3">
          <form>
            <label htmlFor="exampleFormControlTextarea1" className="form-label">
              Error Message from CI Log
            </label>
            <textarea
              name="error"
              className="form-control"
              id="exampleFormControlTextarea1"
              rows="3"
              placeholder="Insert error message"
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
              >
                Clear
              </button>
            </div>
          </form>
        </div>
        <div className="col-12 col-md">
          <p>Matches</p>
          <card id="matches" className="card">
            <p className="pl-2">No Matches</p>
          </card>
        </div>
      </div>
    </>
  );
}
