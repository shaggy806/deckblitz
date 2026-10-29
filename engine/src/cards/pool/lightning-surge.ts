import { defineCard } from "../define.js";

// Either 4 or 6, never both (the ruling); threshold doesn't count this card,
// still on the stack as it resolves.
export default defineCard({
  name: "Lightning Surge",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{5}{R}{R}" },
  text: "Lightning Surge deals 4 damage to any target.\nThreshold — If there are seven or more cards in your graveyard, instead Lightning Surge deals 6 damage to that permanent or player and the damage can't be prevented.\nFlashback {5}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["any-target"],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: { kind: "damage", amount: 6, target: 0, cantBePrevented: true },
    else: { kind: "damage", amount: 4, target: 0 },
  },
});
