import type { MRAGSample } from "../types/mrag";
import { normalizeMragArray } from "../core/parsing/normalizeMragOutput";

export async function parseMragFiles(files: File[]): Promise<MRAGSample[]> {
  const all: MRAGSample[] = [];

  for (const file of files) {
    const text = await file.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error(`Failed to parse JSON in file ${file.name}`, err);
      throw new Error(`File ${file.name} is not valid JSON.`);
    }

    const samples = normalizeMragArray(json).map((s) => ({
      ...s,
      system_name: s.system_name ?? file.name.replace(/\.json$/i, ""),
    }));

    all.push(...samples);
  }

  return all;
}
