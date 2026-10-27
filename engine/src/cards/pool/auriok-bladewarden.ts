import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 25408.

const TEXT = "{T}: Target creature gets +X/+X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Auriok Bladewarden",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
