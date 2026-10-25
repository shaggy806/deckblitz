import { defineCard } from "../define.js";

// EDHREC rank 26231.
// The sacrificed creature's toughness as it last existed on the battlefield
// (the ruling).
const TEXT = "{1}{G}, Sacrifice another creature: You gain life equal to the sacrificed creature's toughness.";

export default defineCard({
  name: "Kheru Dreadmaw",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Crocodile"],
  power: 4,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
