import { defineCard } from "../define.js";

// EDHREC rank 18515.
//
// Rulings: if the target is attacking, the defending player must block it with
// at least one creature that could; flashback follows the sorcery's timing.

export default defineCard({
  name: "Deadly Allure",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashback: { cost: "{G}" },
  text: "Target creature gains deathtouch until end of turn and must be blocked this turn if able.\nFlashback {G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
    ],
  },
});
