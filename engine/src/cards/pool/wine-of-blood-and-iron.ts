import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). The sacrifice is part of the ability's effect
// (Pyric Salamander's shape): a delayed trigger set up as it resolves.
const TEXT =
  "{4}: Target creature gets +X/+0 until end of turn, where X is its power. Sacrifice this artifact at the beginning of the next end step.";

export default defineCard({
  name: "Wine of Blood and Iron",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: { powerOf: 0 }, toughness: 0, duration: "end-of-turn" },
          { kind: "delayed-trigger", at: "next-end-step", effect: { kind: "sacrifice-source" }, text: "Sacrifice Wine of Blood and Iron." },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
