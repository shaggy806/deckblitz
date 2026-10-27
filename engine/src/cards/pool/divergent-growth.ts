import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 26794.

const GRANTED_TEXT = "{T}: Add one mana of any color.";

export default defineCard({
  name: "Divergent Growth",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: 'Until end of turn, lands you control gain "{T}: Add one mana of any color."',
  targets: [],
  effect: {
    kind: "grant-activated-all",
    filter: { type: "land", controlledBy: "you" },
    ability: {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: GRANTED_TEXT,
    },
    duration: "end-of-turn",
  },
});
