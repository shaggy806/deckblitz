import { defineCard } from "../define.js";

// EDHREC rank 8921.
//
// Rulings:
//   If Compy Swarm leaves the battlefield before its triggered ability
//   resolves, the token will still enter as a copy of Compy Swarm, using its
//   copiable values from when it was last on the battlefield.
//   The token copy won't copy counters or damage marked on Compy Swarm.

const TEXT =
  "At the beginning of your end step, if a creature died this turn, create a tapped token that's a copy of this creature.";

export default defineCard({
  name: "Compy Swarm",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, tapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
