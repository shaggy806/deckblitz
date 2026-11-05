import { defineCard } from "../define.js";

// EDHREC rank 28605.

export default defineCard({
  name: "Engulfing Flames",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  flashback: { cost: "{3}{R}" },
  text: "Engulfing Flames deals 1 damage to target creature. It can't be regenerated this turn.\nFlashback {3}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "prohibit", target: 0, regeneration: true },
    ],
  },
});
