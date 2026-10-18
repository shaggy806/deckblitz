import { defineCard } from "../define.js";

// EDHREC rank 21611.
// "Return it unless you remove two oil counters from it": the removal is the
// controller's choice, open only while it has two to remove — a `may` to
// remove them inside a check that it has, and the return otherwise.

const ENTER_TEXT = "When this creature enters, put two oil counters on target artifact or creature you control.";
const END_TEXT =
  "At the beginning of your end step, return this creature to its owner's hand unless you remove two oil counters from it.";

export default defineCard({
  name: "Magmatic Sprinter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${ENTER_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "add-counter", target: 0, counter: "oil", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 2 } },
        then: {
          kind: "may",
          prompt: "Remove two oil counters from Magmatic Sprinter? (Otherwise return it to its owner's hand.)",
          effect: { kind: "remove-counter", target: "source", counter: "oil", amount: 2 },
          else: { kind: "return-to-hand", target: "source" },
        },
        else: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
