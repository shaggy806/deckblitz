import { defineCard } from "../define.js";

// EDHREC rank 26814.

export default defineCard({
  name: "Thalakos Scout",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Thalakos", "Soldier", "Scout"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nDiscard a card: Return this creature to its owner's hand.",
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
