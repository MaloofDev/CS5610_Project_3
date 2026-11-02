import PropTypes from "prop-types";
import "./PlaceholderPage.css";

export default function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder-page">
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="placeholder-page__note">This page is still being built.</p>
    </section>
  );
}

PlaceholderPage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
