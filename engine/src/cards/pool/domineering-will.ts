import { defineCard } from "../define.js";

// Commander 2014 (C14). EDHREC rank 8367. Three sentences, three passes over
// the "up to three" group: the control change as one instruction, then the
// untap, then each one's blocking requirement. An illegal player target
// leaves the creatures with their controllers, still untapped and made to
// block (rule 608.2b).

export default defineCard({
  name: "Domineering Will",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target player gains control of up to three target nonattacking creatures until end of turn. Untap those creatures. They block this turn if able.",
  targets: [
    "player",
    { kind: "any-number", of: { kind: "permanent", filter: { type: "creature", attacking: false } }, max: 3 },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 1,
        simultaneous: true,
        effect: { kind: "gain-control", target: 1, untilEndOfTurn: true, who: { target: 0 } },
      },
      { kind: "for-each-target", from: 1, effect: { kind: "untap", target: 1 } },
      { kind: "for-each-target", from: 1, effect: { kind: "block-if-able", target: 1 } },
    ],
  },
});
