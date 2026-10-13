import { defineCard } from "../define.js";

// EDHREC rank 887.
//
// After the proliferate, any number of the permanents you control that got
// a counter from it (`thisWay: "counters-put"`) — chosen as it resolves, not
// targeted — phase out (rule 702.26b), what's attached to each with it,
// until your next untap step.
const TEXT =
  "Proliferate, then choose any number of permanents you control that had a counter put on them this way. Those permanents phase out. (To proliferate, choose any number of permanents and/or players, then give each another counter of each kind already there. Treat phased-out permanents and anything attached to them as though they don't exist until their controller's next turn.)";

export default defineCard({
  name: "Ripples of Potential",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "proliferate" },
      {
        kind: "choose-permanents",
        filter: { controlledBy: "you", thisWay: "counters-put" },
        upTo: { countOf: { controlledBy: "you" } },
        then: { kind: "phase-out", target: 0 },
        prompt: "Choose any number of them to phase out",
      },
    ],
  },
});
