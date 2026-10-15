import { defineCard } from "../define.js";

export default defineCard({
  name: "Road Rage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Road Rage deals X damage to target creature or planeswalker, where X is 2 plus the number of Mounts and Vehicles you control.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "damage",
    // One permanent that's both a Mount and a Vehicle counts once (the ruling).
    amount: { sum: [2, { countOf: { subtypes: ["Mount", "Vehicle"], controlledBy: "you" } }] },
    target: 0,
  },
});
