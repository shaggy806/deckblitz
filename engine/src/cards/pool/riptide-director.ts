import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 18926.

const TEXT = "{2}{U}{U}, {T}: Draw a card for each Wizard you control.";

export default defineCard({
  name: "Riptide Director",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: { countOf: { subtype: "Wizard", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
