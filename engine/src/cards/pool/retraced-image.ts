import { defineCard } from "../define.js";

// A revealed card without a namesake on the battlefield stays in hand and does
// nothing, so the choice is among the cards that would enter (or none).
export default defineCard({
  name: "Retraced Image",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Reveal a card in your hand, then put that card onto the battlefield if it has the same name as a permanent.",
  effect: {
    kind: "look-and-choose",
    zone: "hand",
    min: 0,
    max: 1,
    reveal: true,
    filter: { sameNameWith: { permanents: {} } },
    destination: "battlefield",
    leftover: "stay",
  },
});
