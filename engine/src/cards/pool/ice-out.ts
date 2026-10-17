import { defineCard } from "../define.js";

// EDHREC rank 7964.

export default defineCard({
  name: "Ice Out",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "", keyword: "bargain", reduceGeneric: 1 },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nThis spell costs {1} less to cast if it's bargained.\nCounter target spell.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
