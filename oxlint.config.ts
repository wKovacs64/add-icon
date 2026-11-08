import { createConfig } from "@wkovacs64/oxlint-config";

export default createConfig({
  overrides: [
    {
      // The bin imports build output (dist), which is untyped when linting before a build.
      files: ["bin/**"],
      rules: { "typescript/no-unsafe-call": "off" },
    },
  ],
});
