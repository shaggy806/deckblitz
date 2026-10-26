import { defineCard } from "../define.js";

const TEXT = "{2}{B}: Each opponent loses 1 life. You gain life equal to the life lost this way.";

export default defineCard({
  name: "Scholar of Athreos",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
