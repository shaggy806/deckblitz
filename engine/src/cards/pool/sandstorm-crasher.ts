import { defineCard } from "../define.js";

// EDHREC rank 14374.
//
// Glorybringer's exert (rule 508.1g), its "when you do" making The Fire
// Crystal's token copy, entering tapped and attacking (rule 508.4 — the
// controller picks whom it attacks when there's a choice) and sacrificed at
// the beginning of the next end step.

const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, create a tapped and attacking token that's a copy of target creature you control. Sacrifice the token at the beginning of the next end step.";

export default defineCard({
  name: "Sandstorm Crasher",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Berserker", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        tapped: true,
        attacking: "choose",
        sacrificeAtEndStep: true,
      },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
