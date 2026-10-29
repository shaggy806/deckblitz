import { defineCard } from "../define.js";

// 1 from each creature each time it would deal combat damage to you (the
// ruling: three unblocked double strikers lose 6 in all).
export default defineCard({
  name: "Thunderstaff",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "As long as this artifact is untapped, if a creature would deal combat damage to you, prevent 1 of that damage.\n{2}, {T}: Attacking creatures get +1/+0 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      replacement: {
        event: "would-deal-damage",
        to: "you",
        combat: true,
        source: { type: "creature" },
        preventAmount: 1,
      },
      text: "As long as this artifact is untapped, if a creature would deal combat damage to you, prevent 1 of that damage.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}, {T}: Attacking creatures get +1/+0 until end of turn.",
    },
  ],
});
