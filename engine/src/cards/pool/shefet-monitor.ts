import { defineCard } from "../define.js";

const CYCLE_TEXT =
  "When you cycle this card, you may search your library for a basic land card or a Desert card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Shefet Monitor",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 6,
  toughness: 5,
  cycling: { cost: "{3}{G}" },
  text: `Cycling {3}{G} ({3}{G}, Discard this card: Draw a card.)\n${CYCLE_TEXT} (Do this before you draw.)`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      // "You may search": declining searches nothing and shuffles nothing.
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card or a Desert card?",
        effect: {
          kind: "search-library",
          filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Desert" }] },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
