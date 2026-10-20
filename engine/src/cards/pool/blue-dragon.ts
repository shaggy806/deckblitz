import { defineCard } from "../define.js";

// EDHREC rank 16851.
//
// The first target is required and must be an opponent's; the other two are
// optional, may be any creature, and each a different one (the rulings) —
// Arm the Cathars' target shape.
const BREATH_TEXT =
  "Lightning Breath — When this creature enters, until your next turn, target creature an opponent controls gets -3/-0, up to one other target creature gets -2/-0, and up to one other target creature gets -1/-0.";

export default defineCard({
  name: "Blue Dragon",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${BREATH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        "creature-an-opponent-controls",
        { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "until-your-next-turn" },
          { kind: "modify-pt", target: 1, power: -2, toughness: 0, duration: "until-your-next-turn" },
          { kind: "modify-pt", target: 2, power: -1, toughness: 0, duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: BREATH_TEXT,
    },
  ],
});
