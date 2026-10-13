import { defineCard } from "../define.js";

// EDHREC rank 7047.
//
// Exactly X targets ("each of X target creatures"), each conniving in turn
// (rule 701.50 — one at a time, in the order chosen); then, once all have
// connived (the ruling), whether each phases out (rule 702.26b) — asked of
// them one by one, which is "any number of them".
const TEXT =
  "Each of X target creatures you control connive. You may have any number of them phase out. (To have a creature connive, draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature. Treat phased-out permanents and anything attached to them as though they don't exist until their controller's next turn.)";

export default defineCard({
  name: "Change of Plans",
  manaCost: "{X}{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "any-number", of: "creature-you-control", min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "connive", target: 0 } },
      {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "may", prompt: "Have it phase out?", effect: { kind: "phase-out", target: 0 } },
      },
    ],
  },
});
