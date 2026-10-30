import { defineCard } from "../define.js";

// Tempest (TMP). "That player returns a creature they control" — not
// targeted, so a hexproof creature can be returned: a `choose-permanents`
// with the upkeep's player as `chooser`, which they must answer while they
// control a creature.

const TEXT = "At the beginning of each player's upkeep, that player returns a creature they control to its owner's hand.";

export default defineCard({
  name: "Sunken Hope",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "active-player",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a creature you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
