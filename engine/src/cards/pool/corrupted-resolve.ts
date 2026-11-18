import { defineCard } from "../define.js";

// EDHREC rank 14103.
//
// Rulings:
//   A player is poisoned if that player has one or more poison counters.
//
// Asked as it resolves, of the target spell's controller then (Skulking
// Killer's `of-player { controllerOf }`): a spell whose controller isn't
// poisoned is still a legal target, and stays on the stack.

const TEXT = "Counter target spell if its controller is poisoned.";

export default defineCard({
  name: "Corrupted Resolve",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "of-player",
      player: { controllerOf: 0 },
      condition: { kind: "player-counters", counter: "poison", who: "you", atLeast: 1 },
    },
    then: { kind: "counter", target: 0 },
  },
});
