import { defineCard } from "../define.js";

export default defineCard({
  name: "Bituminous Blast",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nBituminous Blast deals 4 damage to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
