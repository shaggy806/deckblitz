import { defineCard } from "../define.js";

// EDHREC rank 7364.
export default defineCard({
  name: "Pearl of Wisdom",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "This spell costs {1} less to cast if you control an Otter.\nDraw two cards.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Otter" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  effect: { kind: "draw", amount: 2 },
});
