import React from "react";

export const AboutPage: React.FC = () => {
  return (
    <section>
      <h1>About GAP</h1>
      <p>
        GAP is a browser-only evaluation toolkit designed to assess MRAG systems with 
        three metrics—Ground Formula(G), Answer Accuracy(A), and Provenance Accuracy(P), 
        plus a weighted overall score.
      </p>
      <p>
        It is intended as a companion tool for the GAP paper. Users can download the
        benchmark questions, run them on their own MRAG systems, and upload the JSON
        outputs here to obtain a standardized evaluation report.
      </p>
      <p>
        All computation is performed locally; no uploaded data leave your browser.
      </p>
    </section>
  );
};
