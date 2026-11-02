import { useParams } from "react-router-dom";
import PlaceholderPage from "./PlaceholderPage.jsx";

export default function IssueForm() {
  const { id } = useParams();
  return (
    <PlaceholderPage
      title={id ? "Edit known issue" : "New known issue"}
      description="Create or edit a known issue with its title, repository, affected releases, test or job, error snippet, category, status, and fix notes."
    />
  );
}
