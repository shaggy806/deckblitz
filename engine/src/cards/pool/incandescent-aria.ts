import { defineCard } from "../define.js";

export default defineCard({
  name: "Incandescent Aria",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["sorcery"],
  text: "Incandescent Aria deals 3 damage to each nontoken creature.",
  effect: { kind: "damage-all", amount: 3, filter: { type: "creature", token: false } },
});
