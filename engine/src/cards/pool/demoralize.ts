import { defineCard } from "../define.js";

// EDHREC rank 22264.

export default defineCard({
  name: "Demoralize",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "All creatures gain menace until end of turn. (They can't be blocked except by two or more creatures.)\n" +
    "Threshold — If there are seven or more cards in your graveyard, creatures can't block this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      // Gaining an ability changes characteristics: the creatures there now
      // (rule 611.2c).
      { kind: "grant-keyword-all", filter: { type: "creature" }, keyword: "menace", duration: "end-of-turn" },
      // "Can't block" is a rule for the turn: it binds a creature that
      // enters later too (`restrict` with a filter).
      {
        kind: "conditional",
        condition: { kind: "threshold" },
        then: { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-block"] },
      },
    ],
  },
});
