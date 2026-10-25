import { defineCard } from "../define.js";

const ENTERS =
  "When this creature enters, put a +1/+1 counter on it for each card in your hand. If you do, discard your hand.";
const LEAVES = "When this creature leaves the battlefield, draw a card for each +1/+1 counter on it.";

// Rulings: the counters are mandatory; "if you do" fails only when it has left
// the battlefield (no counters can go on it), and then the hand is kept. The
// leaves trigger counts every +1/+1 counter it last had.
export default defineCard({
  name: "Thought Gorger",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${ENTERS}\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { cardsInHand: "you" } },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "counters-put", atLeast: 1 },
            then: { kind: "discard-hand", who: "you" },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: LEAVES,
    },
  ],
});
