import { defineCard } from "../define.js";

export default defineCard({
  name: "Captured Sunlight",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nYou gain 4 life.",
  effect: { kind: "gain-life", amount: 4 },
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
