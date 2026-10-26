import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 26803. The delayed return reads the ability's own
// target; one that has left the battlefield since is a new object (rule 400.7)
// and isn't returned.

const TEXT =
  "{3}, {T}: Target creature you control gets +2/+2 until end of turn. Return it to its owner's hand at the beginning of the next end step.";

export default defineCard({
  name: "Dragon Mask",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (Return it only if it's on the battlefield.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "return-to-hand", target: 0 },
            text: "Return it to its owner's hand.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
