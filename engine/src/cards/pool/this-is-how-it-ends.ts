import { defineCard } from "../define.js";

// EDHREC rank 8651. Doctor Who.
//
// The target's owner shuffles it in, then faces a villainous choice (rule
// 701.55) — asked of that owner through `{ ownerOf: 0 }`, which still names
// them once the creature is in their library (an owner never changes, rule
// 108.3). "They shuffle another creature they own" is theirs to choose, not
// a target: a `choose` of a creature **they own** (`own` reads `ownedBy:
// "you"` from the chooser's side), wherever it is and whoever controls it,
// then shuffled into its owner's library. The first one has already left the
// battlefield, so any creature of theirs still there is "another". Either
// option may be chosen even when it would do nothing (rule 701.55b).
const TEXT =
  "Target creature's owner shuffles it into their library, then faces a villainous choice — They lose 5 life, or they shuffle another creature they own into their library.";

export default defineCard({
  name: "This Is How It Ends",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-into-library", target: 0 },
      {
        kind: "each-player-may",
        villainous: true,
        who: { ownerOf: 0 },
        choices: [
          {
            text: "They lose 5 life.",
            effect: { kind: "lose-life", amount: 5, who: "that-player" },
          },
          {
            text: "They shuffle another creature they own into their library.",
            effect: {
              kind: "sequence",
              effects: [
                {
                  kind: "vote",
                  choose: true,
                  who: "that-player",
                  for: { permanent: { type: "creature", ownedBy: "you" }, own: true },
                },
                { kind: "for-each-voted", which: "voted", effect: { kind: "shuffle-into-library", target: 0 } },
              ],
            },
          },
        ],
      },
    ],
  },
});
