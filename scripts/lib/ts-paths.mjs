// Import this first in a test that loads site data through "@/" imports.
import { register } from "node:module";

register("./ts-paths-hooks.mjs", import.meta.url);
