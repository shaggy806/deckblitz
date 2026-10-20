import { defineCard } from "../define.js";

// EDHREC rank 2929.
//
// "That wasn't cast from its owner's hand": cast from anywhere else, or not
// cast at all — a copy never is, so it's always a legal target, whatever the
// original was cast from (the ruling). There's no negated `castFrom`, so it's
// every other zone a spell is cast from, plus `cast: false`.

export default defineCard({
  name: "Wash Away",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cleave {1}{U}{U} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nCounter target spell [that wasn't cast from its owner's hand].",
  targets: [
    {
      kind: "spell",
      filter: {
        anyOf: [
          { cast: false },
          { castFrom: "graveyard" },
          { castFrom: "exile" },
          { castFrom: "library" },
          { castFrom: "command" },
          { castFrom: "battlefield" },
          { castFrom: "stack" },
        ],
      },
    },
  ],
  effect: { kind: "counter", target: 0 },
  cleave: {
    cost: "{1}{U}{U}",
    targets: ["spell"],
    effect: { kind: "counter", target: 0 },
  },
});
