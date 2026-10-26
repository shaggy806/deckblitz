import { defineCard } from "../define.js";

// Saviors of Kamigawa.
export default defineCard({
  name: "One with Nothing",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Discard your hand.",
  targets: [],
  effect: { kind: "discard-hand", who: "you" },
});
