import { defineCard } from "../define.js";

// EDHREC rank 19204.

const TEXT = "Sacrifice this creature: You may tap or untap target creature.";

export default defineCard({
  name: "Teardrop Kami",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      // Retreat to Coralhelm's "you may tap or untap target creature".
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target creature.", effect: { kind: "tap", target: 0 } },
          { text: "Untap target creature.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
