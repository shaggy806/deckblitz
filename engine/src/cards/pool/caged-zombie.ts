import { defineCard } from "../define.js";

// EDHREC rank 24316.

export default defineCard({
  name: "Caged Zombie",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  text: "{1}{B}, {T}: Each opponent loses 2 life. Activate only if a creature died this turn.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-opponent" },
      resolve: null,
      condition: { kind: "creature-died-this-turn" },
      text: "{1}{B}, {T}: Each opponent loses 2 life. Activate only if a creature died this turn.",
    },
  ],
});
