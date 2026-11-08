import { defineCard } from "../define.js";

// EDHREC rank 14888.
//
// The Equipment is chosen as this resolves, not targeted (the ruling).

export default defineCard({
  name: "Light of Judgment",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Light of Judgment deals 6 damage to target creature. Destroy up to one Equipment attached to that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      {
        kind: "choose-permanents",
        filter: { subtype: "Equipment", attachedToObject: 0 },
        upTo: 1,
        prompt: "Choose up to one Equipment attached to that creature",
        then: { kind: "destroy", target: 0 },
      },
    ],
  },
});
