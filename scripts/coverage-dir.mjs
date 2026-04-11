import { mkdir } from "node:fs/promises";

await mkdir("coverage", { recursive: true });
