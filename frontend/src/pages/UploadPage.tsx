import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileDropZone } from "../components/upload/FileDropZone";
import { FileList } from "../components/upload/FileList";
import { useGap } from "../store/GapContext";
import { parseMragFiles } from "../utils/file";

export const UploadPage: React.FC = () => {
  const { setSamples, samples, reset } = useGap();
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFiles = async (files: File[]) => {
    setError(null);
    setLoading(true);
    try {
      const allSamples = await parseMragFiles(files);
      setSamples(allSamples);
      setFileNames(files.map((f) => f.name));
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to parse files.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setFileNames([]);
    setError(null);
  };

  return (
    <section>
      <h1>Upload MRAG Outputs</h1>
      <p>
        Upload one or more JSON files produced by different MRAG systems. Each file
        should follow the GAP upload schema (see examples in the repository).
      </p>

      <FileDropZone onFilesSelected={handleFiles} />

      {loading && <p>Parsing files, please wait...</p>}
      {error && <p className="gap-error">{error}</p>}

      <FileList fileNames={fileNames} totalSamples={samples.length} />

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
        <button
          className="gap-button"
          disabled={samples.length === 0}
          onClick={() => navigate("/evaluation")}
        >
          Go to Evaluation
        </button>
        <button className="gap-button-secondary" onClick={handleReset}>
          Clear
        </button>
      </div>
    </section>
  );
};
