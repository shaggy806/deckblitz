import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31283.
//
// "Its controller sacrifices it" — whoever controls the creature at the end
// step, not the Sword's controller (`byItsController`).

const TEXT =
  "{3}, {T}: Target creature you control gets +3/+3 until end of turn. Its controller sacrifices it at the beginning of the next end step.";

export default defineCard({
  name: "Celestial Sword",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            text: "Its controller sacrifices it at the beginning of the next end step.",
            effect: { kind: "sacrifice-target", target: 0, byItsController: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
