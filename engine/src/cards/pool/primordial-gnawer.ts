import { defineCard } from "../define.js";

export default defineCard({
  name: "Primordial Gnawer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Horror"],
  power: 5,
  toughness: 2,
  text: "When this creature dies, discover 3. (Exile cards from the top of your library until you exile a nonland card with mana value 3 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "discover", amount: 3 },
      resolve: null,
      text: "When this creature dies, discover 3.",
    },
  ],
});
