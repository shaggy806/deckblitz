import { defineCard } from "../define.js";

// Torment. EDHREC rank 31881. Threshold read as it resolves (rule 702.27);
// with it, First Volley's shape: the creature and its controller (as it last
// existed, rule 608.2h) are dealt damage at once.

export default defineCard({
  name: "Kamahl's Sledge",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kamahl's Sledge deals 4 damage to target creature.\nThreshold — If there are seven or more cards in your graveyard, instead Kamahl's Sledge deals 4 damage to that creature and 4 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: 4, target: 0 },
        { kind: "damage", amount: 4, toControllerOfTarget: 0 },
      ],
    },
    else: { kind: "damage", amount: 4, target: 0 },
  },
});
