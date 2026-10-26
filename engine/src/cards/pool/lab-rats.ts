import { defineCard } from "../define.js";

// EDHREC rank 12857.
// Makes Rat → use "Rat Token".

export default defineCard({
  name: "Lab Rats",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "{4}", keyword: "buyback" },
  text: "Buyback {4} (You may pay an additional {4} as you cast this spell. If you do, put this card into your hand as it resolves.)\nCreate a 1/1 black Rat creature token.",
  effect: { kind: "create-token", token: "Rat Token", count: 1 },
});
