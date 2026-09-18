import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.tsx",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true,
  },
  external: ["react", "react/jsx-runtime", "better-qr", "better-qr/render-model"],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.rollup.json",
    }),
  ],
  treeshake: {
    moduleSideEffects: false,
  },
};
