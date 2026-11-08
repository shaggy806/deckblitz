import { defineCard } from "../define.js";

// EDHREC rank 23507.

export default defineCard({
  name: "Turn to Slag",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Turn to Slag deals 5 damage to target creature. Destroy all Equipment attached to that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "destroy-all", filter: { subtype: "Equipment", attachedToObject: 0 } },
    ],
  },
});
