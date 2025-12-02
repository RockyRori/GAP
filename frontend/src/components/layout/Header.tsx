import React from "react";
import { Link } from "react-router-dom";

export const Header: React.FC = () => {
  return (
    <header className="gap-header">
      <div className="gap-header-inner">
        <div className="gap-logo">
          <span className="gap-logo-mark">GAP</span>
          <span className="gap-logo-text">MRAG Bench Evaluator</span>
        </div>
        <nav className="gap-nav">
          <Link to="/">Home</Link>
          <Link to="/build">Build</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/evaluation">Evaluation</Link>
          <Link to="/report">Report</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
    </header>
  );
};
