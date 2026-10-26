import { defineCard } from "../define.js";
import { prowl } from "../helpers.js";

// EDHREC rank 18598.

export default defineCard({
  name: "Latchkey Faerie",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nProwl {2}{U} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Faerie or Rogue.)\nWhen this creature enters, if its prowl cost was paid, draw a card.",
  alternativeCost: prowl("{2}{U}"),
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      condition: { kind: "self-prowl-paid" },
      resolve: null,
      text: "When this creature enters, if its prowl cost was paid, draw a card.",
    },
  ],
});
