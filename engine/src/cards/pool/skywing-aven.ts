import { defineCard } from "../define.js";

export default defineCard({
  name: "Skywing Aven",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 1,
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
