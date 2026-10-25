import { defineCard } from "../define.js";

// EDHREC rank 21388. Eldritch Moon.

export default defineCard({
  name: "Wretched Gryff",
  manaCost: "{7}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Hippogriff"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  alternativeCost: { mana: "{5}{U}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Emerge {5}{U} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, draw a card.\nFlying",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When you cast this spell, draw a card.",
    },
  ],
});
