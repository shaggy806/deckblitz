import { defineCard } from "../define.js";

export default defineCard({
  name: "Twin Bolt",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Twin Bolt deals 2 damage divided as you choose among one or two targets.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
  divided: { total: 2, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
