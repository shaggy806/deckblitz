import { defineCard } from "../define.js";

const TEXT =
  "{X}, {T}: Target creature you control gets +X/+X until end of turn. Destroy it at the beginning of the next end step.";

export default defineCard({
  name: "Puffer Extract",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: "x", toughness: "x", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "destroy", target: 0 },
            text: "Destroy it at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
