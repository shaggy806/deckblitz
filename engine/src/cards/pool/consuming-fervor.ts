import { defineCard } from "../define.js";

// EDHREC rank 22143. Amonkhet. The granted trigger is the enchanted
// creature's own ability (Cathar's Call's shape), so "your" upkeep is its
// controller's; two Fervors grant it twice (the ruling).
const UPKEEP_TEXT = "At the beginning of your upkeep, put a -1/-1 counter on this creature.";
const GRANT_TEXT = `Enchanted creature gets +3/+3 and has "${UPKEEP_TEXT}"`;

export default defineCard({
  name: "Consuming Fervor",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
