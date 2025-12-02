// src/pages/UploadPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileDropZone } from "../components/upload/FileDropZone";
import { FileList } from "../components/upload/FileList";
import { useGap } from "../store/GapContext";
import type { MRAGSample } from "../types/mrag";
import {
  parseAnswerFile,
  parseResultFiles,
  mergeGoldAndPred,
} from "../utils/file";

export const UploadPage: React.FC = () => {
  const { setSamples, samples, reset } = useGap();

  const [answerFileName, setAnswerFileName] = useState<string | null>(null);
  const [answerCount, setAnswerCount] = useState<number>(0);
  const [goldSamples, setGoldSamples] = useState<MRAGSample[]>([]);

  const [resultFileNames, setResultFileNames] = useState<string[]>([]);
  const [resultCount, setResultCount] = useState<number>(0);
  const [predSamples, setPredSamples] = useState<MRAGSample[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const recomputeMergedSamples = (gold: MRAGSample[], preds: MRAGSample[]) => {
    if (gold.length === 0 || preds.length === 0) {
      // 任意一方为空就清空全局样本，避免误评测
      setSamples([]);
      return;
    }
    const merged = mergeGoldAndPred(gold, preds);
    setSamples(merged);
  };

  const handleAnswerFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const gold = await parseAnswerFile(file);
      setGoldSamples(gold);
      setAnswerFileName(file.name);
      setAnswerCount(gold.length);

      // 尝试与已有的预测结果合并
      recomputeMergedSamples(gold, predSamples);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to parse answer.json.");
      setGoldSamples([]);
      setAnswerFileName(null);
      setAnswerCount(0);
      setSamples([]);
    } finally {
      setLoading(false);
      // 重置 input，否则同一个文件再次选择不会触发 onChange
      e.target.value = "";
    }
  };

  const handleResultFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setError(null);
    setLoading(true);

    try {
      const preds = await parseResultFiles(files);
      setPredSamples(preds);
      setResultFileNames(files.map((f) => f.name));
      setResultCount(preds.length);

      // 尝试与已有的答案合并
      recomputeMergedSamples(goldSamples, preds);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to parse result_new JSON files.");
      setPredSamples([]);
      setResultFileNames([]);
      setResultCount(0);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setGoldSamples([]);
    setPredSamples([]);
    setAnswerFileName(null);
    setAnswerCount(0);
    setResultFileNames([]);
    setResultCount(0);
    setError(null);
  };

  return (
    <section>
      <h1>Upload MRAG Outputs</h1>
      <p>
        GAP now expects the benchmark to be split into two parts: a ground-truth{" "}
        <code>answer.json</code> file and one or more{" "}
        <code>result_new.json</code> files produced by external MRAG systems.
        Answers are never exposed to the evaluated systems.
      </p>

      {/* 1. 上传 answer.json */}
      <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
        <h2>Step 1. Upload Ground-Truth Answers (answer.json)</h2>
        <p>
          The <code>answer.json</code> file contains only benchmark questions and
          gold annotations (answers, formulas, and provenance). It should follow
          the GAP answer schema provided in the repository.
        </p>
        <input
          type="file"
          accept="application/json"
          onChange={handleAnswerFileChange}
        />
        {answerFileName ? (
          <p style={{ marginTop: "0.5rem" }}>
            Loaded answer file: <strong>{answerFileName}</strong> with{" "}
            <strong>{answerCount}</strong> questions.
          </p>
        ) : (
          <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
            No answer file loaded yet.
          </p>
        )}
      </div>

      {/* 2. 上传若干 result_new.json */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Step 2. Upload MRAG Predictions (result_new.json)</h2>
        <p>
          Upload one or more <code>result_new.json</code> files, each produced by
          an MRAG system on the same question set. Each file should contain only
          prediction fields (predicted answers, formulas, and provenance) without
          gold labels.
        </p>

        <FileDropZone onFilesSelected={handleResultFiles} />

        <FileList
          fileNames={resultFileNames}
          totalSamples={resultCount}
        />
      </div>

      {loading && <p>Parsing files, please wait...</p>}
      {error && <p className="gap-error">{error}</p>}

      <div style={{ marginTop: "1.5rem" }}>
        <p>
          Current merged evaluation samples:{" "}
          <strong>{samples.length}</strong>. GAP will only evaluate the
          intersection of questions that appear in <code>answer.json</code> and
          the uploaded <code>result_new.json</code> files.
        </p>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
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
