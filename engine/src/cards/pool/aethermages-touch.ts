import { defineCard } from "../define.js";

// EDHREC rank 21165.
//
// Terminal Velocity's shape: the creature put onto the battlefield is the
// `then`'s target 0, and gains the end-step trigger for good — it returns at
// its controller's next end step, not this one if it's already the end step
// (the rulings); one that left meanwhile is a new object without it.

const GRANTED_TEXT = "At the beginning of your end step, return this creature to its owner's hand.";

export default defineCard({
  name: "Aethermage's Touch",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: `Reveal the top four cards of your library. You may put a creature card from among them onto the battlefield. It gains "${GRANTED_TEXT}" Then put the rest of the cards revealed this way on the bottom of your library in any order.`,
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: true,
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "battlefield",
    leftover: "bottom-any-order",
    then: {
      kind: "grant-triggered",
      target: 0,
      duration: "permanent",
      ability: {
        trigger: { on: "step-begins", step: "end", who: "you" },
        targets: [],
        effect: { kind: "return-to-hand", target: "source" },
        resolve: null,
        text: GRANTED_TEXT,
      },
    },
  },
});
