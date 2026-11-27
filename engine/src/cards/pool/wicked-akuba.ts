import { defineCard } from "../define.js";

// EDHREC rank 27761.

export default defineCard({
  name: "Wicked Akuba",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "{B}: Target player dealt damage by this creature this turn loses 1 life.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [{ kind: "player-dealt-damage-by-source" }],
      effect: { kind: "lose-life", amount: 1, target: 0 },
      resolve: null,
      text: "{B}: Target player dealt damage by this creature this turn loses 1 life.",
    },
  ],
});
