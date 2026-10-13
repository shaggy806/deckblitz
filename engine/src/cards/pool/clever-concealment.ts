import { defineCard } from "../define.js";

// EDHREC rank 556.
//
// Each target phases out (rule 702.26b) with whatever is attached to it
// (702.26g) — an Equipment targeted along with the creature it's on phases
// out indirectly, with it (702.26h) — at once, until your next untap step.
const TEXT =
  "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nAny number of target nonland permanents you control phase out. (Treat them and anything attached to them as though they don't exist until your next turn.)";

export default defineCard({
  name: "Clever Concealment",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  convoke: true,
  targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } } }],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "phase-out", target: 0 } },
});
