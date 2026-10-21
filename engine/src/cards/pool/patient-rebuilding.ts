import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, target opponent mills three cards, then you draw a card for each land card put into their graveyard this way.";

// "Put into their graveyard this way" counts the milled land cards that are
// in a graveyard: one a replacement sent elsewhere (Rest in Peace) was
// milled but isn't counted (the ruling), and only this resolution's mill is.
export default defineCard({
  name: "Patient Rebuilding",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 3 },
          { kind: "draw", amount: { countInGraveyard: { thisWay: "milled", type: "land" } } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
