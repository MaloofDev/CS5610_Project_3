import { useParams } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage.jsx";

export default function RunForm() {
  const { id } = useParams();
  return (
    <PlaceholderPage
      title={id ? "Edit run" : "Log run"}
      description="Create or edit a CI run with its repository, release, branch, commit, status, duration, and per-test results, or fill the form from a pasted JSON summary."
    />
  );
}
