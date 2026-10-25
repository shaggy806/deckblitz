import { defineCard } from "../define.js";

export default defineCard({
  name: "Inner Struggle",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature deals damage to itself equal to its power.",
  targets: ["creature"],
  effect: { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
});
