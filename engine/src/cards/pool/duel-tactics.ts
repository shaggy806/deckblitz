import { defineCard } from "../define.js";

// EDHREC rank 19168.

export default defineCard({
  name: "Duel Tactics",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{1}{R}" },
  text: "Duel Tactics deals 1 damage to target creature. It can't block this turn.\nFlashback {1}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
    ],
  },
});
