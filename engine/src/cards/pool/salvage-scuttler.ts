import { defineCard } from "../define.js";

// EDHREC rank 24387.
//
// Not targeted: the artifact is chosen as the trigger resolves (Shrieking
// Drake's shape), and with none there's nothing to return.
//
// Rulings:
//   [2017-02-09] If you control no artifacts, you won't return anything to your hand. There's no
//     penalty for being unable to do so.

const ATTACK_TEXT = "Whenever this creature attacks, return an artifact you control to its owner's hand.";

export default defineCard({
  name: "Salvage Scuttler",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab"],
  power: 4,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "artifact", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return an artifact you control to its owner's hand",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
