import { defineCard } from "../define.js";

export default defineCard({
  name: "Run Aground",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target artifact or creature on top of its owner's library.",
  targets: ["artifact-or-creature"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
