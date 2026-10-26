import { defineCard } from "../define.js";

// EDHREC rank 17757.
const TEXT = "{U}, {T}: You may tap or untap target creature.";

export default defineCard({
  name: "Niblis of the Breath",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature"],
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
