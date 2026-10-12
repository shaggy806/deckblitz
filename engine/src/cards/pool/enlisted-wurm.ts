import { defineCard } from "../define.js";

export default defineCard({
  name: "Enlisted Wurm",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 5,
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)",
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
