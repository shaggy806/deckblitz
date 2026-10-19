import { defineCard } from "../define.js";

// EDHREC rank 18425. The Brothers' War.

const ATTACK_TEXT = "Whenever this creature attacks, draw a card.";
const STATIC_TEXT = `Enchanted creature gets +1/+0 and has flying and "${ATTACK_TEXT}"`;

export default defineCard({
  name: "Take Flight",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["flying"],
      // The creature's own ability: its controller draws.
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
