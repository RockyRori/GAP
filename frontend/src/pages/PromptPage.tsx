// src/pages/PromptPage.tsx
import React, { useEffect, useState } from "react";

// 静态资源路径：基于 Vite 的 BASE_URL
const PROMPT_URL = `${import.meta.env.BASE_URL}prompt.txt`;

export const PromptPage: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(PROMPT_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load prompt.txt", err);
        setError("Failed to load prompt template.");
        setLoading(false);
      });
  }, []);

  return (
    <section>
      <h1>Prompt Template</h1>
      <p>
        This page shows the standardized prompt template used by GAP. You can
        copy it directly or download the original <code>prompt.txt</code> file.
      </p>

      <div style={{ margin: "1rem 0" }}>
        <a
          className="gap-button"
          href={PROMPT_URL}
          download="prompt.txt"
        >
          Download prompt.txt
        </a>
      </div>

      {loading && <p>Loading prompt template…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <pre
          style={{
            border: "1px solid #ddd",
            padding: "1rem",
            borderRadius: "4px",
            maxHeight: "60vh",
            overflow: "auto",
            background: "#f7f7f7",
            fontSize: "0.9rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </pre>
      )}
    </section>
  );
};
