import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 15708. Niblis of the Breath's ability: tap,
// untap or neither, chosen as it resolves (its ruling).

const TEXT = "{U}, {T}: You may tap or untap target creature.";

export default defineCard({
  name: "Puppeteer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: TEXT,
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
