import { defineCard } from "../define.js";

// EDHREC rank 6216.
//
// Not an intervening if: the trigger always happens, and "then if you control
// three or more creatures with different powers" is checked as it resolves,
// after the counter goes on (a `conditional` on coven).

const COVEN_TEXT =
  "Coven — At the beginning of combat on your turn, put a +1/+1 counter on up to one target creature you " +
  "control. Then if you control three or more creatures with different powers, draw a card.";

export default defineCard({
  name: "Leinore, Autumn Sovereign",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 0,
  toughness: 4,
  text: COVEN_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "conditional", condition: { kind: "coven" }, then: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: COVEN_TEXT,
    },
  ],
});
