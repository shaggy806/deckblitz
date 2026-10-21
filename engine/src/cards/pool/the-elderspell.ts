import { defineCard } from "../define.js";

// EDHREC rank 13714. The targets are destroyed as one event; only then is the
// planeswalker to get the counters chosen (the ruling — a `choose-permanents`,
// not a target), two for each one actually destroyed (an indestructible one
// isn't). With no planeswalker of yours left, nothing gets them.

export default defineCard({
  name: "The Elderspell",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy any number of target planeswalkers. Choose a planeswalker you control. Put two loyalty counters on it for each planeswalker destroyed this way.",
  targets: [{ kind: "any-number", of: { kind: "permanent", whose: "any", filter: { type: "planeswalker" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      {
        kind: "choose-permanents",
        filter: { type: "planeswalker", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "add-counter", target: 0, counter: "loyalty", amount: { product: [2, { thisWay: "destroyed" }] } },
        prompt: "Choose a planeswalker you control to put two loyalty counters on for each planeswalker destroyed",
      },
    ],
  },
});
