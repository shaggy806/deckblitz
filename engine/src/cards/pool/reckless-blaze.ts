import { defineCard } from "../define.js";

// Strixhaven: School of Mages (STX). EDHREC rank 12164.
//
// The delayed ability (rule 603.7c, "this turn") watches each creature actually dealt damage
// by this spell, in that stint of it (Ghired's Belligerence's shape), firing once for each
// that dies this turn. "A creature you control" is read as the creature last existed on the
// battlefield (rule 603.10a): its controller then, not the owner it goes back to. The {R} is
// added as the ability resolves — it triggers on no mana ability, so it isn't one (rule
// 605.1b) — and empties with the step it was added in.

const DIES_TEXT = "Whenever a creature you control dealt damage this way dies this turn, add {R}.";

export default defineCard({
  name: "Reckless Blaze",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: `Reckless Blaze deals 5 damage to each creature. ${DIES_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 5, filter: { type: "creature" } },
      {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "dies", who: "self", filter: { controlledBy: "you" } },
          watching: { thisWay: "dealt-damage" },
        },
        effect: { kind: "add-mana", mana: "R", amount: 1 },
        text: DIES_TEXT,
      },
    ],
  },
});
