import { defineCard } from "../define.js";

// EDHREC rank 18137.

export default defineCard({
  name: "Artifact Blast",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Counter target artifact spell.",
  targets: [{ kind: "spell", filter: { type: "artifact" } }],
  effect: { kind: "counter", target: 0 },
});
