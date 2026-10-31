import { defineCard } from "../define.js";

// A requirement (rule 509.1c): it blocks some attacker when it can, and
// obeying another requirement instead counts the same.
const BLOCKS = "This creature blocks each combat if able.";

export default defineCard({
  name: "Razorgrass Screen",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 2,
  toughness: 1,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${BLOCKS}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-block"], text: BLOCKS }],
});
