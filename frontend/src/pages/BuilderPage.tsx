import React, { useState } from "react";
import type { MRAGSample } from "../types/mrag";
import { parseAnswerFile } from "../utils/file";
import { downloadJsonReport } from "../utils/download";

/** 从现有样本中推断下一个 question_id（Q001, Q002, ...） */
function getNextQuestionId(samples: MRAGSample[]): string {
  let maxIndex = 0;
  for (const s of samples) {
    const m = s.question_id.match(/\d+/);
    if (m) {
      const num = parseInt(m[0], 10);
      if (!Number.isNaN(num) && num > maxIndex) {
        maxIndex = num;
      }
    }
  }
  const nextIndex = maxIndex + 1;
  return `Q${nextIndex.toString().padStart(3, "0")}`;
}

export const BuilderPage: React.FC = () => {
  const [answerSamples, setAnswerSamples] = useState<MRAGSample[]>([]);
  const [answerFileName, setAnswerFileName] = useState<string | null>(null);

  const [questionText, setQuestionText] = useState("");
  const [goldAnswer, setGoldAnswer] = useState("");
  const [goldFormula, setGoldFormula] = useState("");
  const [goldDocName, setGoldDocName] = useState("");
  const [goldPage, setGoldPage] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnswerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const samples = await parseAnswerFile(file);
      setAnswerSamples(samples);
      setAnswerFileName(file.name);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to parse answer.json.");
      setAnswerSamples([]);
      setAnswerFileName(null);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleAddQuestion = () => {
    setError(null);

    if (!questionText.trim()) {
      setError("Question text cannot be empty.");
      return;
    }

    if (!goldAnswer.trim()) {
      setError("Gold answer cannot be empty.");
      return;
    }

    if (!goldFormula.trim()) {
      setError("Gold formula LaTeX cannot be empty.");
      return;
    }

    if (!goldDocName.trim()) {
      setError("Gold document name cannot be empty.");
      return;
    }

    const pageNum = goldPage.trim() ? Number(goldPage.trim()) : null;
    if (goldPage.trim() && Number.isNaN(pageNum)) {
      setError("Gold page must be a valid number.");
      return;
    }

    const nextQuestionId = getNextQuestionId(answerSamples);

    const newSample: MRAGSample = {
      system_name: null,
      question_id: nextQuestionId,
      question_text: questionText.trim(),

      gold_answer: goldAnswer.trim() || null,
      pred_answer: null,

      gold_formula_latex: goldFormula.trim() || null,
      pred_formula_latex: null,

      gold_doc_name: goldDocName.trim() || null,
      pred_doc_name: null,

      gold_page: pageNum,
      pred_page: null,

      retrieved_chunks: [],
      confidence: null,
      timestamp: null,
    };

    setAnswerSamples((prev) => [...prev, newSample]);

    setQuestionText("");
    setGoldAnswer("");
    setGoldFormula("");
    setGoldDocName("");
    setGoldPage("");
  };

  // ✅ 修改：导出 answer.json 的字段和顺序
  const handleDownloadAnswer = () => {
    const answerArray = answerSamples.map((s) => ({
      system_name: s.system_name ?? null,
      timestamp: s.timestamp ?? null,
      question_id: s.question_id,
      question_text: s.question_text,
      gold_doc_name: s.gold_doc_name,
      pred_doc_name: s.pred_doc_name,
      gold_page: s.gold_page,
      pred_page: s.pred_page,
      gold_formula_latex: s.gold_formula_latex,
      pred_formula_latex: s.pred_formula_latex,
      gold_answer: s.gold_answer,
      pred_answer: s.pred_answer,
    }));

    downloadJsonReport(answerArray, "answer.json");
  };

  // ✅ 修改：导出 question.json 的字段和顺序
  const handleDownloadQuestion = () => {
    const questionArray = answerSamples.map((s) => ({
      system_name: s.system_name ?? null,
      timestamp: s.timestamp ?? null,
      question_id: s.question_id,
      question_text: s.question_text,
      pred_doc_name: null,
      pred_page: null,
      pred_formula_latex: null,
      pred_answer: null,
    }));

    downloadJsonReport(questionArray, "question.json");
  };

  const handleClearAll = () => {
    setAnswerSamples([]);
    setAnswerFileName(null);
    setQuestionText("");
    setGoldAnswer("");
    setGoldFormula("");
    setGoldDocName("");
    setGoldPage("");
    setError(null);
  };

  return (
    <section className="gap-page">
      <h1>GAP Builder</h1>
      <p>
        This page helps you build <code>answer.json</code> and <code>question.json</code> for GAP.
        You can either load an existing <code>answer.json</code> or start from scratch.
      </p>

      <div className="gap-card" style={{ marginTop: "1rem" }}>
        <h2>1. Load Existing answer.json (Optional)</h2>
        <p>Upload an existing answer.json to continue editing or appending new questions.</p>
        <input type="file" accept=".json,application/json" onChange={handleAnswerFileChange} />
        {answerFileName && (
          <p style={{ marginTop: "0.5rem" }}>
            Loaded file: <strong>{answerFileName}</strong> ({answerSamples.length} samples)
          </p>
        )}
        {loading && <p>Loading answer.json, please wait...</p>}
        {error && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>
            <strong>Error:</strong> {error}
          </p>
        )}
      </div>

      <div className="gap-card" style={{ marginTop: "1.5rem" }}>
        <h2>2. Add New Question</h2>
        <p>
          Fill in the fields below to add a new question with its gold information. Fields marked as
          &quot;gold&quot; will be used as ground truth in GAP evaluation.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            maxWidth: "720px",
          }}
        >
          <div>
            <label>
              Question Text (question_text)
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                style={{ width: "100%", marginTop: "0.25rem" }}
              />
            </label>
          </div>

          <div>
            <label>
              Gold Answer (gold_answer)
              <input
                type="text"
                value={goldAnswer}
                onChange={(e) => setGoldAnswer(e.target.value)}
                style={{ width: "100%", marginTop: "0.25rem" }}
                placeholder='e.g., "1200"'
              />
            </label>
          </div>

          <div>
            <label>
              Gold Formula LaTeX (gold_formula_latex)
              <textarea
                value={goldFormula}
                onChange={(e) => setGoldFormula(e.target.value)}
                rows={2}
                style={{ width: "100%", marginTop: "0.25rem", fontFamily: "monospace" }}
                placeholder='e.g., R = \\frac{V_\\infty}{TSFC} \\frac{L}{D} \\ln\\left(\\frac{W_0}{W_1}\\right)'
              />
            </label>
          </div>

          <div>
            <label>
              Gold Document Name (gold_doc_name)
              <input
                type="text"
                value={goldDocName}
                onChange={(e) => setGoldDocName(e.target.value)}
                style={{ width: "100%", marginTop: "0.25rem" }}
                placeholder='e.g., "Range and endurance.pdf"'
              />
            </label>
          </div>

          <div>
            <label>
              Gold Page (gold_page)
              <input
                type="number"
                value={goldPage}
                onChange={(e) => setGoldPage(e.target.value)}
                style={{ width: "100%", marginTop: "0.25rem" }}
                placeholder="e.g., 7"
              />
            </label>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <button className="gap-button" onClick={handleAddQuestion}>
              Add Question to answer.json
            </button>
            <button
              className="gap-button gap-button-secondary"
              style={{ marginLeft: "0.75rem" }}
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <section className="gap-card" style={{ marginTop: "1.5rem" }}>
        <h2>3. Download JSON Files</h2>
        <p>
          After adding all questions, you can download <code>answer.json</code> and{" "}
          <code>question.json</code> following the GAP schema.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
          <button
            className="gap-button"
            disabled={answerSamples.length === 0}
            onClick={handleDownloadAnswer}
          >
            Download answer.json
          </button>
          <button
            className="gap-button"
            disabled={answerSamples.length === 0}
            onClick={handleDownloadQuestion}
          >
            Download question.json
          </button>
        </div>
      </section>
    </section>
  );
};

export default BuilderPage;
