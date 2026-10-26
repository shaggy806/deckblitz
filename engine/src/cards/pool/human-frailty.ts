import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 28184.

export default defineCard({
  name: "Human Frailty",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target Human creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Human" } }],
  effect: { kind: "destroy", target: 0 },
});
