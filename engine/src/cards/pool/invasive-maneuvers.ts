import { defineCard } from "../define.js";

// Rulings:
//   Whether you control a Spacecraft is checked as Invasive Maneuvers
//   resolves (the `conditional`, read on resolution).

export default defineCard({
  name: "Invasive Maneuvers",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Invasive Maneuvers deals 3 damage to target creature. It deals 5 damage instead if you control a Spacecraft.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { subtype: "Spacecraft" }, atLeast: 1 },
    then: { kind: "damage", amount: 5, target: 0 },
    else: { kind: "damage", amount: 3, target: 0 },
  },
});
