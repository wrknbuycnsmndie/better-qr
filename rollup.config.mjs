import typescript from "@rollup/plugin-typescript";

function createConfig(input, file) {
  return {
    input,
    output: {
      file,
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.rollup.json",
      }),
    ],
    treeshake: {
      moduleSideEffects: false,
    },
  };
}

export default [
  createConfig("src/index.ts", "dist/index.js"),
  createConfig("src/render-model.ts", "dist/render-model.js"),
];
