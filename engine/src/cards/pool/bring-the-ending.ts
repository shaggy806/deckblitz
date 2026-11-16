import { defineCard } from "../define.js";

// EDHREC rank 10587.
//
// Corrupted reads the targeted spell's controller as it resolves: with three
// or more poison counters the spell is countered outright, no payment
// offered.

export default defineCard({
  name: "Bring the Ending",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {2}.\nCorrupted — Counter that spell instead if its controller has three or more poison counters.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "player-counters", counter: "poison", who: { controllerOf: 0 }, atLeast: 3 },
    then: { kind: "counter", target: 0 },
    else: {
      kind: "unless",
      chooser: 0,
      options: [{ pay: "{2}", text: "Pay {2}" }],
      otherwise: { kind: "counter", target: 0 },
    },
  },
});
