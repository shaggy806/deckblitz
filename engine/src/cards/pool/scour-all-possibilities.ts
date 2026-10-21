import { defineCard } from "../define.js";

// EDHREC rank 10570.

export default defineCard({
  name: "Scour All Possibilities",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{4}{U}" },
  text: "Scry 2, then draw a card.\nFlashback {4}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "scry", amount: 2, then: { kind: "draw", amount: 1 } },
});
