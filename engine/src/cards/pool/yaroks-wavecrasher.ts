import { defineCard } from "../define.js";

// Not a target: chosen as it resolves, and with no other creature nothing
// returns (its ruling).

export default defineCard({
  name: "Yarok's Wavecrasher",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, return another creature you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        exceptSource: true,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return another creature you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return another creature you control to its owner's hand.",
    },
  ],
});
