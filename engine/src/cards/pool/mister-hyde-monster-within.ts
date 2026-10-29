import { defineCard } from "../define.js";

// EDHREC rank 16205.
//
// "Remove a counter from a creature you control": which creature and which
// kind are chosen as it resolves; with no counter on any creature nothing is
// removed, and nothing is drawn.

export default defineCard({
  name: "Mister Hyde, Monster Within",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 2,
  text: "At the beginning of your upkeep, choose one —\n• Put a +1/+1 counter on Mister Hyde.\n• Remove a counter from a creature you control. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a +1/+1 counter on Mister Hyde.",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
          {
            text: "Remove a counter from a creature you control. If you do, draw a card.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "remove-counters", from: { type: "creature" }, counter: "any", count: 1 },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "counters-removed" },
                  then: { kind: "draw", amount: 1 },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, choose one —\n• Put a +1/+1 counter on Mister Hyde.\n• Remove a counter from a creature you control. If you do, draw a card.",
    },
  ],
});
