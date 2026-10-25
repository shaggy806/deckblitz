import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 19791. The enters trigger always fires; only
// the discard asks whether it was kicked (the ruling).

const ETB_TEXT = "When this creature enters, draw three cards. Then if it wasn't kicked, discard three cards.";

export default defineCard({
  name: "Sphinx of Lost Truths",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  kicker: { cost: "{1}{U}" },
  text: `Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\nFlying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "self-kicked" } },
            then: { kind: "discard", target: "you", amount: 3 },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
