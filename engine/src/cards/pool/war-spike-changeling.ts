import { defineCard } from "../define.js";

export default defineCard({
  name: "War-Spike Changeling",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\n{R}: This creature gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R}: This creature gains first strike until end of turn.",
    },
  ],
});
