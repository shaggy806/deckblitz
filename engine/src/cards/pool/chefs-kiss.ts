import { defineCard } from "../define.js";

// Outlaws of Thunder Junction (OTJ).
//
// The spell is yours once you gain control of it (rule 112.2), so its targets
// are reselected — and judged legal — from your side: "a creature you
// control" can then only be one of yours, which you can't pick, so it keeps
// its target (the rulings). Each instance of "target" is drawn for afresh;
// one with nothing left to draw from keeps its target, legal or not.
// Copying and reselecting aren't casting.
const TEXT =
  "Gain control of target spell that targets only a single permanent or player. Copy it, then reselect the targets at random for the spell and the copy. The new targets can't be you or a permanent you control.";

export default defineCard({
  name: "Chef's Kiss",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "spell", filter: { targets: { only: true, single: true, permanent: {}, player: "any" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control-spell", target: 0 },
      { kind: "copy-spell", target: 0 },
      { kind: "change-targets", target: 0, how: "random", exceptYou: true, withCopies: true },
    ],
  },
});
