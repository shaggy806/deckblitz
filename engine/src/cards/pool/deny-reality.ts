import { defineCard } from "../define.js";

export default defineCard({
  name: "Deny Reality",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nReturn target permanent to its owner's hand.",
  targets: ["permanent"],
  effect: { kind: "return-to-hand", target: 0 },
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
