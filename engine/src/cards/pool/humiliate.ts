import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] You may cast Humiliate even if you control no creatures.
//   [2021-04-16] You choose which creature to put the +1/+1 counter on as Humiliate is resolving,
//     after their hand has been revealed.

export default defineCard({
  name: "Humiliate",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. Put a +1/+1 counter on a creature you control.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        prompt: "Choose a creature you control to put a +1/+1 counter on",
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
    ],
  },
});
