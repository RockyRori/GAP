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
  const next = maxIndex + 1 || 1;
  return `Q${String(next).padStart(3, "0")}`;
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

  const nextQuestionId = getNextQuestionId(answerSamples);

  const handleUploadAnswer = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    const pageNum =
      goldPage.trim() === "" ? null : Number.parseInt(goldPage.trim(), 10);

    if (goldPage.trim() !== "" && Number.isNaN(pageNum)) {
      setError("gold_page must be an integer or left empty.");
      return;
    }

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

    // 清空输入，准备下一题
    setQuestionText("");
    setGoldAnswer("");
    setGoldFormula("");
    setGoldDocName("");
    setGoldPage("");
  };

  const handleDownloadAnswer = () => {
    downloadJsonReport(answerSamples, "answer.json");
  };

  const handleDownloadQuestion = () => {
    const questionArray = answerSamples.map((s) => ({
      system_name: null,
      question_id: s.question_id,
      question_text: s.question_text,
    //   gold_answer: null,
      pred_answer: null,
    //   gold_formula_latex: null,
      pred_formula_latex: null,
    //   gold_doc_name: null,
      pred_doc_name: null,
    //   gold_page: null,
      pred_page: null,
      retrieved_chunks: [] as any[],
      confidence: null,
      timestamp: null,
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
    <section>
      <h1>Build Question & Answer Files</h1>
      <p>
        Use this page to construct <code>answer.json</code> and the corresponding{" "}
        <code>question.json</code> locally in your browser. You can optionally
        load an existing <code>answer.json</code>, append new questions, and
        export the updated files at any time.
      </p>

      {/* 1. 可选上传现有 answer.json */}
      <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
        <h2>Step 1. (Optional) Load Existing answer.json</h2>
        <input
          type="file"
          accept="application/json"
          onChange={handleUploadAnswer}
        />
        {answerFileName ? (
          <p style={{ marginTop: "0.5rem" }}>
            Loaded answer file: <strong>{answerFileName}</strong> with{" "}
            <strong>{answerSamples.length}</strong> questions.
          </p>
        ) : (
          <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
            No answer file loaded yet. You can start from an empty set.
          </p>
        )}
      </div>

      {/* 2. 输入新题目 */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Step 2. Add New Question-Answer Pairs</h2>
        <p>
          The next question will be assigned ID{" "}
          <code>{nextQuestionId}</code>. Fill in the following fields and click{" "}
          <strong>Add Question</strong>.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
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
              />
            </label>
          </div>

          <div>
            <label>
              Gold Formula LaTeX (gold_formula_latex)
              <input
                type="text"
                value={goldFormula}
                onChange={(e) => setGoldFormula(e.target.value)}
                style={{ width: "100%", marginTop: "0.25rem" }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ flex: 2 }}>
              <label>
                Gold Document Name (gold_doc_name)
                <input
                  type="text"
                  value={goldDocName}
                  onChange={(e) => setGoldDocName(e.target.value)}
                  style={{ width: "100%", marginTop: "0.25rem" }}
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label>
                Gold Page (gold_page)
                <input
                  type="text"
                  value={goldPage}
                  onChange={(e) => setGoldPage(e.target.value)}
                  placeholder="e.g., 12"
                  style={{ width: "100%", marginTop: "0.25rem" }}
                />
              </label>
            </div>
          </div>
        </div>

        {error && <p className="gap-error" style={{ marginTop: "0.5rem" }}>{error}</p>}
        {loading && <p>Loading answer.json, please wait...</p>}

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
          <button className="gap-button" onClick={handleAddQuestion}>
            Add Question
          </button>
          <button className="gap-button-secondary" onClick={handleClearAll}>
            Clear All
          </button>
        </div>
      </div>

      {/* 3. 当前题目列表 */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Current Questions ({answerSamples.length})</h2>
        {answerSamples.length === 0 ? (
          <p style={{ color: "#6b7280" }}>
            No questions in the current answer set.
          </p>
        ) : (
          <table className="gap-table">
            <thead>
              <tr>
                <th>Question ID</th>
                <th>Question Text</th>
                <th>Gold Answer</th>
                <th>Gold Doc</th>
                <th>Gold Page</th>
              </tr>
            </thead>
            <tbody>
              {answerSamples.map((s) => (
                <tr key={s.question_id}>
                  <td>{s.question_id}</td>
                  <td>{s.question_text}</td>
                  <td>{s.gold_answer ?? ""}</td>
                  <td>{s.gold_doc_name ?? ""}</td>
                  <td>{s.gold_page ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. 导出按钮 */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
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
  );
};
