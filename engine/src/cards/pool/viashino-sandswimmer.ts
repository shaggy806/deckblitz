import { defineCard } from "../define.js";

// EDHREC rank 25780.

const TEXT =
  "{R}: Flip a coin. If you win the flip, return this creature to its owner's hand. If you lose the flip, sacrifice this creature.";

export default defineCard({
  name: "Viashino Sandswimmer",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "flip-coin",
        won: { kind: "return-to-hand", target: "source" },
        lost: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
