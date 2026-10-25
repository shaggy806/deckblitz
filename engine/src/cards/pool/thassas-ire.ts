import { defineCard } from "../define.js";

const TEXT = "{3}{U}: You may tap or untap target creature.";

export default defineCard({
  name: "Thassa's Ire",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
