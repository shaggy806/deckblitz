import { defineCard } from "../define.js";

// Torment (TOR). EDHREC rank 13992.
//
// `copy-spell`'s `forEachItCouldTarget` on its target slot, with players,
// less the one the spell targets (rule 707.10d). Its target's every target is
// one permanent or one player. "Could target" is judged as the spell's
// controller would choose it; the copies are yours, and you order them —
// with players among them, a copy at a time.

const TEXT =
  "Choose target instant or sorcery spell that targets only a single permanent or player. Copy that spell for each other permanent or player the spell could target. Each copy targets a different one of those permanents and players.";

export default defineCard({
  name: "Radiate",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [
    {
      kind: "spell",
      filter: {
        typesAnyOf: ["instant", "sorcery"],
        targets: { only: true, single: true, permanent: {}, player: "any" },
      },
    },
  ],
  effect: {
    kind: "copy-spell",
    target: 0,
    forEachItCouldTarget: { filter: {}, players: true, other: "targeted" },
  },
});
