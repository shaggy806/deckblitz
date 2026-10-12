import { defineCard } from "../define.js";

// EDHREC rank 15492.
// Read as it resolves: a creature you controlled as it left has left the
// battlefield this turn.

export default defineCard({
  name: "That's Rough Buddy",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text:
    "Put a +1/+1 counter on target creature. Put two +1/+1 counters on that creature instead if a creature left the battlefield under your control this turn.\n" +
    "Draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: {
          ifCondition: { kind: "turn-history", what: "left", filter: { type: "creature" } },
          then: 2,
          else: 1,
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
