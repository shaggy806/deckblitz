import { defineCard } from "../define.js";

// EDHREC rank 15768.
export default defineCard({
  name: "Reckless Scholar",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: "{T}: Target player draws a card, then discards a card.",
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
      text: "{T}: Target player draws a card, then discards a card.",
    },
  ],
});
