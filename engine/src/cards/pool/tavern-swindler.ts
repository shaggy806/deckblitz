import { defineCard } from "../define.js";

const TEXT = "{T}, Pay 3 life: Flip a coin. If you win the flip, you gain 6 life.";

export default defineCard({
  name: "Tavern Swindler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 3 },
      targets: [],
      effect: { kind: "flip-coin", won: { kind: "gain-life", amount: 6 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
