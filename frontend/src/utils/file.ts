// src/utils/file.ts
import type { MRAGSample } from "../types/mrag";
import { normalizeMragArray } from "../core/parsing/normalizeMragOutput";

/**
 * 解析 answer.json：
 * - 只上传 1 个文件
 * - 文件中每一项包含 gold_* 字段（答案、公式、文档、页码）
 * - system_name 通常为 null
 */
export async function parseAnswerFile(file: File): Promise<MRAGSample[]> {
  const text = await file.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error(`Failed to parse JSON in answer file ${file.name}`, err);
    throw new Error(`Answer file ${file.name} is not valid JSON.`);
  }

  const samples = normalizeMragArray(json);

  // 强制 answer 文件中不设置 system_name，避免污染系统名称
  return samples.map((s) => ({
    ...s,
    system_name: null,
  }));
}

/**
 * 解析多个 result.json：
 * - 可以一次上传多个文件，对应多个 MRAG 系统
 * - 每个文件只包含 pred_* 字段（预测结果）
 * - gold_* 字段通常为 null
 * - 若 system_name 为空，用文件名（去掉 .json）作为系统名
 */
export async function parseResultFiles(files: File[]): Promise<MRAGSample[]> {
  const all: MRAGSample[] = [];

  for (const file of files) {
    const text = await file.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error(`Failed to parse JSON in result file ${file.name}`, err);
      throw new Error(`Result file ${file.name} is not valid JSON.`);
    }

    const samples = normalizeMragArray(json).map((s) => ({
      ...s,
      system_name:
        (s.system_name ?? file.name.replace(/\.json$/i, "").trim()) || "UNKNOWN_SYSTEM",
    }));

    all.push(...samples);
  }

  return all;
}

/**
 * 将 answer.json 提供的 gold 信息，与多个 result.json 中的 pred 信息按 question_id 进行合并。
 *
 * - goldSamples：来自 answer.json，只填 gold_* 字段
 * - predSamples：来自 result.json，只填 pred_* 字段
 *
 * 返回：每条样本包含 gold + pred + provenance 信息，用于后续评测。
 * 规则：
 * - 仅合并 question_id 能在 answer.json 中找到的预测样本，避免把缺少 gold 的样本拉低分数；
 * - 如果某个 question_id 在多个系统中都有结果，会生成多条样本（按 system_name 区分）。
 */
export function mergeGoldAndPred(
  goldSamples: MRAGSample[],
  predSamples: MRAGSample[]
): MRAGSample[] {
  const goldByQid = new Map<string, MRAGSample>();
  for (const g of goldSamples) {
    if (!g.question_id) continue;
    goldByQid.set(g.question_id, g);
  }

  const merged: MRAGSample[] = [];

  for (const p of predSamples) {
    const qid = p.question_id;
    if (!qid) continue;

    const g = goldByQid.get(qid);
    if (!g) {
      // 控制台提示一下，论文里也可以写“我们只评测有 gold 的样本”
      console.warn(
        `Prediction for question_id=${qid} (system=${p.system_name ?? "UNKNOWN_SYSTEM"}) has no matching gold entry in answer.json and will be ignored.`
      );
      continue;
    }

    merged.push({
      system_name: p.system_name ?? g.system_name ?? null,
      question_id: qid,
      question_text: g.question_text || p.question_text,

      gold_answer: g.gold_answer,
      pred_answer: p.pred_answer,

      gold_formula_latex: g.gold_formula_latex,
      pred_formula_latex: p.pred_formula_latex,

      gold_doc_name: g.gold_doc_name,
      pred_doc_name: p.pred_doc_name,

      gold_page: g.gold_page,
      pred_page: p.pred_page,

      // provenance 相关信息以预测结果为主
      retrieved_chunks: p.retrieved_chunks,
      confidence: p.confidence,
      timestamp: p.timestamp,
    });
  }

  return merged;
}
