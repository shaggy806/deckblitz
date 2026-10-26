import { defineCard } from "../define.js";

export default defineCard({
  name: "Boulderfall",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Boulderfall deals 5 damage divided as you choose among any number of targets.",
  targets: [{ kind: "any-number", of: "any-target", max: 5 }],
  divided: { total: 5, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
