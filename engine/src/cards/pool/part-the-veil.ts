import { defineCard } from "../define.js";

// Champions of Kamigawa.

export default defineCard({
  name: "Part the Veil",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Return all creatures you control to their owner's hand.",
  effect: { kind: "return-to-hand-all", filter: { type: "creature", controlledBy: "you" } },
});
