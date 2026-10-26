import { defineCard } from "../define.js";

export default defineCard({
  name: "Ephemeron",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nDiscard a card: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "Discard a card: Return this creature to its owner's hand.",
    },
  ],
});
