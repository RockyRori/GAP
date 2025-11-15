import type { MRAGSample } from "../../types/mrag";

export function normalizeMragArray(input: unknown): MRAGSample[] {
  if (!Array.isArray(input)) {
    throw new Error("Uploaded JSON must be an array.");
  }

  return input.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Item at index ${index} is not an object.`);
    }

    const obj = item as any;

    // 简单的防御式解析，缺失字段用 null / [] 顶一下
    const sample: MRAGSample = {
      system_name: obj.system_name ?? null,
      question_id: String(obj.question_id ?? ""),
      question_text: String(obj.question_text ?? ""),
      gold_answer: obj.gold_answer ?? null,
      pred_answer: obj.pred_answer ?? null,
      gold_formula_latex: obj.gold_formula_latex ?? null,
      pred_formula_latex: obj.pred_formula_latex ?? null,
      gold_doc_name: obj.gold_doc_name ?? null,
      pred_doc_name: obj.pred_doc_name ?? null,
      gold_page:
        obj.gold_page === null || obj.gold_page === undefined
          ? null
          : Number(obj.gold_page),
      pred_page:
        obj.pred_page === null || obj.pred_page === undefined
          ? null
          : Number(obj.pred_page),
      retrieved_chunks: Array.isArray(obj.retrieved_chunks)
        ? obj.retrieved_chunks.map((c: any) => ({
            doc_name: String(c.doc_name ?? ""),
            page:
              c.page === null || c.page === undefined
                ? null
                : Number(c.page),
            score:
              c.score === null || c.score === undefined
                ? null
                : Number(c.score),
          }))
        : [],
      confidence:
        obj.confidence === null || obj.confidence === undefined
          ? null
          : Number(obj.confidence),
      timestamp: obj.timestamp ?? null,
    };

    if (!sample.question_id) {
      throw new Error(`Missing question_id at index ${index}.`);
    }

    return sample;
  });
}
