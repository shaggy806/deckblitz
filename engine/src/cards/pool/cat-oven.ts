import { defineCard } from "../define.js";

// A playtest card (Mystery Booster 2).

export default defineCard({
  name: "Cat Oven",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "When Cat Oven enters the battlefield, create a Food token.\n{T}, Sacrifice a Food: Create a 1/1 black Cat creature token. Each opponent loses 1 life and you gain 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "When Cat Oven enters the battlefield, create a Food token.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Food" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "1/1 Black Cat Token", count: 1 },
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "{T}, Sacrifice a Food: Create a 1/1 black Cat creature token. Each opponent loses 1 life and you gain 1 life.",
    },
  ],
});
