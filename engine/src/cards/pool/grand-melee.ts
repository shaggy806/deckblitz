import { defineCard } from "../define.js";

const ATTACK = "All creatures attack each combat if able.";
const BLOCK = "All creatures block each combat if able.";

export default defineCard({
  name: "Grand Melee",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ATTACK}\n${BLOCK}`,
  static: [
    { affects: { scope: "all-creatures" }, restrictions: ["must-attack"], text: ATTACK },
    { affects: { scope: "all-creatures" }, restrictions: ["must-block"], text: BLOCK },
  ],
});
