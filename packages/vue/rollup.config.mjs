import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true,
  },
  external: ["vue", /^better-qr(?:\/.*)?$/],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.rollup.json",
    }),
  ],
  treeshake: {
    moduleSideEffects: false,
  },
};
