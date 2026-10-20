import { defineCard } from "../define.js";

// EDHREC rank 23832.
//
// Rulings:
//   [2021-04-16] If a creature's power is less than 0 when it's doubled, instead that creature
//     gets -X/-0, where X is how much less than 0 its power is.
//   [2021-04-16] If an effect instructs you to "double" a creature's power, that creature gets
//     +X/+0, where X is its power as that effect begins to apply. The same is true for toughness.
//
// Okaun, Eye of Chaos's `doubling` amounts.
const DOUBLE_TEXT = "{4}{G}: Double this creature's power and toughness until end of turn.";

export default defineCard({
  name: "Reckless Amplimancer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: DOUBLE_TEXT,
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source", doubling: true },
        toughness: { toughnessOf: "source", doubling: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
});
