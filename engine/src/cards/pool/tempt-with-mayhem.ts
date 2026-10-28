import { defineCard } from "../define.js";

// EDHREC rank 4959.
//
// Tempt with Reflections' tempting offer, over a spell: each opponent is
// asked in turn order from the active player (the ruling), and one who
// accepts copies the spell as their own effect ("you" in `each-player-may`'s
// `effect` is them), so they control the copy and choose its new targets,
// and it goes on the stack before the next is asked. Once all have answered,
// `ifDid` gives you a copy for each who did, then the last step your one
// copy — so your copies are on top and resolve first (the ruling). The
// copies aren't cast (rule 707.10), and Tempt can't target itself (115.5).
//
// Rulings:
//   [2024-06-07] Each of the copies will have the same targets as the spell it's copying unless
//     its controller chooses new ones. That player may change any number of the targets, including
//     all of them or none of them. The new targets must be legal. If, for any target, they can't
//     choose a new legal target, then it remains unchanged (even if the current target is
//     illegal).
//   [2024-06-07] Starting with the next opponent in turn order (or the active player, if that
//     player is one of your opponents), each opponent in turn order decides whether or not to copy
//     the spell and, if they do, whether or not to choose new targets. Then, if that player did
//     choose to copy the spell, the copy is put onto the stack. Finally, you copy that spell at
//     least once (hopefully more, if the mayhem was tempting enough) and choose new targets for
//     your copies if you wish. This means that your copies of the spell will resolve first,
//     followed by the copies created by your opponents in the opposite order in which they were
//     created.

const COPY = { kind: "copy-spell", target: 0, newTargets: true } as const;

export default defineCard({
  name: "Tempt with Mayhem",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Tempting offer — Choose target instant or sorcery spell. Each opponent may copy that spell and may choose new targets for the copy they control. You copy that spell once plus an additional time for each opponent who copied the spell this way. You may choose new targets for the copies you control.",
  targets: ["instant-or-sorcery-spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Copy that spell (you may choose new targets for your copy)?",
        effect: COPY,
        ifDid: COPY,
      },
      COPY,
    ],
  },
});
