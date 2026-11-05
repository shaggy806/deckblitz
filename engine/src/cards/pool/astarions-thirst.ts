import { defineCard } from "../define.js";

export default defineCard({
  name: "Astarion's Thirst",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature. Put X +1/+1 counters on a commander creature you control, where X is the power of the creature exiled this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "choose-permanents",
        filter: { type: "creature", isCommander: true, controlledBy: "you" },
        min: 1,
        upTo: 1,
        prompt: "Choose a commander creature you control to put the +1/+1 counters on",
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { thisWay: "exiled", sumOf: "power" } },
      },
    ],
  },
});
