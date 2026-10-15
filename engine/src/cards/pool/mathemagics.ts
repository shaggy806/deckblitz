import { defineCard } from "../define.js";

// EDHREC rank 4592.

export default defineCard({
  name: "Mathemagics",
  manaCost: "{X}{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player draws 2ˣ cards. (2⁰ = 1, 2¹ = 2, 2² = 4, 2³ = 8, 2⁴ = 16, 2⁵ = 32, and so on.)",
  targets: ["player"],
  // 2⁰ = 1: at X = 0 it still draws a card.
  effect: { kind: "draw", amount: { powerOfTwo: "x" }, target: 0 },
});
