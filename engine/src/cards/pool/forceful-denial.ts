import { defineCard } from "../define.js";

export default defineCard({
  name: "Forceful Denial",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nCounter target spell.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
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
