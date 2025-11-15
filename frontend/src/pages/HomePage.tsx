import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  return (
    <section>
      <h1>GAP: MRAG Formula & Answer Evaluation</h1>
      <p>
        GAP is a lightweight, browser-based toolkit to evaluate Retrieval-Augmented
        Generation (RAG / MRAG) systems on cross-document formula grounding and
        mathematical question answering.
      </p>
      <p>
        All evaluation is done locally in your browser: you upload JSON outputs from
        different MRAG systems, GAP computes metrics, and you can download a report.
      </p>
      <div style={{ marginTop: "1.5rem" }}>
        <Link to="/upload" className="gap-button">
          Start by uploading MRAG outputs
        </Link>
      </div>
    </section>
  );
};
