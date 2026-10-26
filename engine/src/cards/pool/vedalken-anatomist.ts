import { defineCard } from "../define.js";

// EDHREC rank 25635.
//
// Rulings:
//   If the creature is an illegal target as the ability resolves, none of
//     it happens. The tap-or-untap choice is made as it resolves
//     (Stonybrook Angler's optional modal).

const TEXT = "{2}{U}, {T}: Put a -1/-1 counter on target creature. You may tap or untap that creature.";

export default defineCard({
  name: "Vedalken Anatomist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Vedalken", "Wizard"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
          {
            kind: "modal",
            minModes: 0,
            maxModes: 1,
            modes: [
              { text: "Tap that creature.", effect: { kind: "tap", target: 0 } },
              { text: "Untap that creature.", effect: { kind: "untap", target: 0 } },
            ],
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
