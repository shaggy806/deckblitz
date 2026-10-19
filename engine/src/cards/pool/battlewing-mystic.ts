import { defineCard } from "../define.js";

// EDHREC rank 26822.

const ETB_TEXT = "When this creature enters, if it was kicked, discard your hand, then draw two cards.";

export default defineCard({
  name: "Battlewing Mystic",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Kicker {R} (You may pay an additional {R} as you cast this spell.)\nFlying\n${ETB_TEXT}`,
  kicker: { cost: "{R}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
