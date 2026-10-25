import { defineCard } from "../define.js";

// EDHREC rank 19055.

const INSPIRED =
  "Inspired — Whenever this creature becomes untapped, each opponent loses 1 life. You gain life equal to the life lost this way.";

export default defineCard({
  name: "Servant of Tymaret",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 3,
  text: `${INSPIRED}\n{2}{B}: Regenerate this creature.`,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: INSPIRED,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{B}: Regenerate this creature.",
    },
  ],
});
