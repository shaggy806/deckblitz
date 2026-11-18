import { defineCard } from "../define.js";

// EDHREC rank 17250.
//
// Rulings (2015-11-04), in short: a replacement's extra tokens each enter
// blocking too, and the delayed ability exiles them all; it triggers at end of
// combat whatever happens to the original. A token blocks the creature it
// copies even if that creature can't be blocked, or the token couldn't block
// it (menace, protection), and it was never declared as a blocker, so "whenever
// blocks" doesn't trigger and no cost to block applies. A token that isn't a
// creature isn't blocking. Each copies only the copiable values ({X} is 0).
//
// `attackingYou: "or-your-planeswalkers"` is "attacking you or a planeswalker
// you control" (rule 506.2), never a battle. `blockingWhatItCopies` puts each
// copy into combat blocking its original (rule 509.4), whatever restricts
// blocks; `exileAtEndOfCombat` is the delayed exile.
const TEXT =
  "Cast this spell only during the declare blockers step.\nFor each creature attacking you or a planeswalker you control, create a token that's a copy of that creature and that's blocking that creature. Exile those tokens at end of combat.";

export default defineCard({
  name: "Mirror Match",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers"] },
  targets: [],
  effect: {
    kind: "create-token-copy",
    of: { each: { type: "creature", attackingYou: "or-your-planeswalkers" } },
    count: 1,
    who: "you",
    blockingWhatItCopies: true,
    exileAtEndOfCombat: true,
  },
});
