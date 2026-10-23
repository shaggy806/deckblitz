import { defineCard } from "../define.js";

// EDHREC rank 7567.
const DRAW_TEXT = "{T}: Draw a card for each Ally you control.";

export default defineCard({
  name: "Sea Gate Loremaster",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard", "Ally"],
  power: 1,
  toughness: 3,
  text: DRAW_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "draw", amount: { countOf: { subtype: "Ally", controlledBy: "you" } } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
