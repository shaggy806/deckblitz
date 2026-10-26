import { defineCard } from "../define.js";

// Conflux (CON).
//
// An intervening if (rule 603.4): checked as it enters and again as it
// resolves, though not necessarily the same black permanent (the rulings).

const ENTERS =
  "When this creature enters, if you control a black permanent, target player loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Parasitic Strix",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { colors: ["B"] }, atLeast: 1 },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
