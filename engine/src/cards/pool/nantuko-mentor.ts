import { defineCard } from "../define.js";

// EDHREC rank 23855.
//
// Rulings:
//   [2004-10-04] The value of X is determined when the ability resolves. The value will not change
//     over time.

const TEXT = "{2}{G}, {T}: Target creature gets +X/+X until end of turn, where X is that creature's power.";

export default defineCard({
  name: "Nantuko Mentor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: 0 },
        toughness: { powerOf: 0 },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
