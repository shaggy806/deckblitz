import { defineCard } from "../define.js";

// EDHREC rank 15258.

export default defineCard({
  name: "Fanning the Flames",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nFanning the Flames deals X damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: "x", target: 0 },
});
