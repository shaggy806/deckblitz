import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 19567.

export default defineCard({
  name: "Deathmark",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target green or white creature.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] } }],
  effect: { kind: "destroy", target: 0 },
});
