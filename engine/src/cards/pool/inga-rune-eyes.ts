import { defineCard } from "../define.js";

const DIES_TEXT = "When Inga Rune-Eyes dies, draw three cards if three or more creatures died this turn.";

export default defineCard({
  name: "Inga Rune-Eyes",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `When Inga Rune-Eyes enters, scry 3.\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 3 },
      resolve: null,
      text: "When Inga Rune-Eyes enters, scry 3.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // Not an intervening "if": it always triggers, and the count — every
      // creature that died this turn, whoever controlled it, Inga included —
      // is read as it resolves (the rulings).
      effect: {
        kind: "conditional",
        condition: { kind: "turn-history", what: "died", who: "any-player", filter: { type: "creature" }, atLeast: 3 },
        then: { kind: "draw", amount: 3 },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
