import { CHOSEN_CREATURE_TYPE, ODD_OR_EVEN } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 8464.
//
// "A creature" is no target: chosen as this resolves, a hexproof one too, and
// the counter comes first, so it can change that creature's parity.

export default defineCard({
  name: "Zimone's Hypothesis",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may put a +1/+1 counter on a creature. Then choose odd or even. Return each creature with power of the chosen quality to its owner's hand. (Zero is even.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { type: "creature" },
        upTo: 1,
        prompt: "You may put a +1/+1 counter on a creature",
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      {
        kind: "choose-creature-type",
        options: ODD_OR_EVEN,
        prompt: "Choose odd or even",
        then: { kind: "return-to-hand-all", filter: { type: "creature", powerParity: CHOSEN_CREATURE_TYPE } },
      },
    ],
  },
});
