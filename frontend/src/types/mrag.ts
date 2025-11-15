export interface RetrievedChunk {
  doc_name: string;
  page: number | null;
  score: number | null;
}

export interface MRAGSample {
  system_name: string | null;
  question_id: string;
  question_text: string;
  gold_answer: string | null;
  pred_answer: string | null;
  gold_formula_latex: string | null;
  pred_formula_latex: string | null;
  gold_doc_name: string | null;
  pred_doc_name: string | null;
  gold_page: number | null;
  pred_page: number | null;
  retrieved_chunks: RetrievedChunk[];
  confidence: number | null;
  timestamp: string | null;
}
