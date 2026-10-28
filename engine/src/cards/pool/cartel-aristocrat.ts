import { defineCard } from "../define.js";

// EDHREC rank 11997.

export default defineCard({
  name: "Cartel Aristocrat",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 2,
  text: "Sacrifice another creature: This creature gains protection from the color of your choice until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "grant-protection",
        target: "source",
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice another creature: This creature gains protection from the color of your choice until end of turn.",
      otherOnly: true,
    },
  ],
});
