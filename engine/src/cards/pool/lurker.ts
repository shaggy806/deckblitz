import { defineCard } from "../define.js";

// The printed "can't be the target of spells" (not hexproof): every player's spells, while
// it neither attacked nor blocked this turn.

const TEXT = "This creature can't be the target of spells unless it attacked or blocked this turn.";

export default defineCard({
  name: "Lurker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: {
          kind: "source",
          filter: { anyOf: [{ attackedThisTurn: true }, { blockedThisTurn: { relation: "blocked" } }] },
        },
      },
      hexproofFrom: { spellsOnly: true, anyController: true, notHexproof: true },
      text: TEXT,
    },
  ],
});
