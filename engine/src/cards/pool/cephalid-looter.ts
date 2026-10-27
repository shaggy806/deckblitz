import { defineCard } from "../define.js";

// EDHREC rank 19448.

const TEXT = "{T}: Target player draws a card, then discards a card.";

export default defineCard({
  name: "Cephalid Looter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, target: 0 },
          { kind: "discard", target: 0, amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
