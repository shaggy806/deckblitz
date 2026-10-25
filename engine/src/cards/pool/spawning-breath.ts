import { defineCard } from "../define.js";

export default defineCard({
  name: "Spawning Breath",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Spawning Breath deals 1 damage to any target. Create a 0/1 colorless Eldrazi Spawn creature token. It has \"Sacrifice this token: Add {C}.\"",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
    ],
  },
});
