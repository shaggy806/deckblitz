import { defineCard } from "../define.js";

const TEXT = "{4}, {T}: Target opponent loses 2 life, gets a poison counter, then mills six cards.";

export default defineCard({
  name: "Decimator Web",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "add-player-counters", counter: "poison", amount: 1, target: 0 },
          { kind: "mill", target: 0, amount: 6 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
