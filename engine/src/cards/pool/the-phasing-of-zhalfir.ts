import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 11374.
//
// Rulings:
//   Permanents that phase out as The Phasing of Zhalfir's first and second chapter abilities
//     resolve don't phase in during their controllers' untap steps while the Saga is on the
//     battlefield. After it leaves the battlefield, they will phase in during their controller's
//     next untap step as normal.
//   Any continuous effects with a "for as long as" duration ignore phased-out objects. If ignoring
//     those objects causes the effect's conditions to no longer be met, the duration will expire.
//   As a permanent is phased out, Auras and Equipment attached to it also phase out at the same
//     time, and phase in with it.
//
// "It can't phase in for as long as you control this Saga" is `phase-out`'s `cantPhaseIn`: ended
// for good as the Saga leaves, changes hands or phases out (rule 611.2b), the permanent then
// phasing in at its controller's next untap step. Chapter III's tokens are counted per player from
// the creatures destroyed under each one's control (March of Souls' shape).

const READ_AHEAD =
  "Read ahead (Choose a chapter and start with that many lore counters. Add one after your draw step. Skipped chapters don't trigger. Sacrifice after III.)";
const CHAPTER_I_II =
  "I, II — Another target nonland permanent phases out. It can't phase in for as long as you control this Saga.";
const CHAPTER_III =
  "III — Destroy all creatures. For each creature destroyed this way, its controller creates a 2/2 black Phyrexian creature token.";

export default defineCard({
  name: "The Phasing of Zhalfir",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `${READ_AHEAD}\n${CHAPTER_I_II}\n${CHAPTER_III}`,
  readAhead: true,
  chapters: [
    {
      at: [1, 2],
      targets: [{ kind: "other", of: "nonland-permanent" }],
      effect: { kind: "phase-out", target: 0, cantPhaseIn: "while-you-control-source" },
      resolve: null,
      text: CHAPTER_I_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy-all", filter: { type: "creature" } },
          {
            kind: "create-token",
            token: "Phyrexian Token (The Phasing of Zhalfir)",
            who: "each-player",
            count: { thisWay: "destroyed", who: "each" },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
