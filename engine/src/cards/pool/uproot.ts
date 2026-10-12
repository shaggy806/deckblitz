import { defineCard } from "../define.js";

export default defineCard({
  name: "Uproot",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Put target land on top of its owner's library.",
  targets: ["land"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
