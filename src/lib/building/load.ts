// The /building page's only way to its data, at build time.
//   LIVE_DATA_FILE=/path/live.json  -> the daily job's real file (CI and the
//                                      job set it); a missing or broken file
//                                      FAILS the build, never a silent sample.
//   not set                         -> the sample fixture (sample: true): the
//                                      page shows a "sample data" banner and
//                                      is noindex; deploy.sh refuses it (P7.9).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { checkLive, type LiveData } from "./live";

const DIR = join(process.cwd(), "src/lib/building");
const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));

// One read per build: the header, footer, home and /building all ask for it.
const cache = new Map<string, LiveData>();

export function loadLive(file: string | undefined = process.env.LIVE_DATA_FILE): LiveData {
  const path = file || join(DIR, "live.sample.json");
  const hit = cache.get(path);
  if (hit) return hit;
  if (!existsSync(path)) throw new Error(`/building: live.json not found at ${path}`);
  const data = readJson(path);
  const errors = checkLive(readJson(join(DIR, "live.schema.json")), data);
  if (errors.length) throw new Error(`/building: live.json breaks the contract:\n${errors.join("\n")}`);
  cache.set(path, data as LiveData);
  return data as LiveData;
}
