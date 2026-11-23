import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). A Vehicle is a target even while it
// isn't a creature.

export default defineCard({
  name: "Where We're Going...",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put a flying counter on target creature or Vehicle.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
