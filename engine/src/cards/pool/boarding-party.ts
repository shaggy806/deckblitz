import { defineCard } from "../define.js";

export default defineCard({
  name: "Boarding Party",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 6,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)",
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
