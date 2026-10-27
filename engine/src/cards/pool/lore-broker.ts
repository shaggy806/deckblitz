import { defineCard } from "../define.js";

// EDHREC rank 10781.

const TEXT = "{T}: Each player draws a card, then discards a card.";

export default defineCard({
  name: "Lore Broker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, who: "each-player" },
          { kind: "discard", target: "each-player", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
