import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV).

export default defineCard({
  name: "Cyclopean Snare",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{3}, {T}: Tap target creature, then return this artifact to its owner's hand.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "return-to-hand", target: "source" },
        ],
      },
      resolve: null,
      text: "{3}, {T}: Tap target creature, then return this artifact to its owner's hand.",
    },
  ],
});
