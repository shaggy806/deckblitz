import { defineCard } from "../define.js";

// EDHREC rank 17145.
// "For each card type among spells you've cast this turn": the `castThisTurn`
// amount's `cardTypes`, each card type once among the spells as they were
// cast (an artifact creature spell gives two; legendary is a supertype).

const DRAW_TEXT = "At the beginning of your end step, draw a card for each card type among spells you've cast this turn.";

export default defineCard({
  name: "April O'Neil, Hacktivist",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 1,
  toughness: 5,
  text: DRAW_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: { castThisTurn: {}, cardTypes: true } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
