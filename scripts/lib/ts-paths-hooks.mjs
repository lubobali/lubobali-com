// Node resolve hooks for the tests: "@/x" -> src/x.ts and "./y" -> y.ts, the
// way Next resolves them, so a test can load the site's own data files
// (types are stripped by Node). Registered by scripts/lib/ts-paths.mjs.
const SRC = new URL("../../src/", import.meta.url);

export async function resolve(specifier, context, next) {
  const spec = specifier.startsWith("@/") ? new URL(specifier.slice(2), SRC).href : specifier;
  try {
    return await next(spec, context);
  } catch (err) {
    const local = spec.startsWith(".") || spec.startsWith("file:");
    if (!local || /\.[a-z]+$/.test(spec)) throw err;
    try {
      return await next(`${spec}.ts`, context);
    } catch {
      return next(`${spec}/index.ts`, context); // a folder, like Next
    }
  }
}
