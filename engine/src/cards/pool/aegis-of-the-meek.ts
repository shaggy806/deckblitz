import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 30349.
//
// Pendelhaven's ability, for {1} more.

export default defineCard({
  name: "Aegis of the Meek",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}: Target 1/1 creature gets +1/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", power: { op: "eq", n: 1 }, toughness: { op: "eq", n: 1 } },
        },
      ],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{1}, {T}: Target 1/1 creature gets +1/+2 until end of turn.",
    },
  ],
});
