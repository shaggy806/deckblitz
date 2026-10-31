import { defineCard } from "../define.js";

// "Attacks or blocks": it can attack only in its controller's combat and
// block only in another player's, so the two requirements never meet.
const EACH_COMBAT = "This creature attacks or blocks each combat if able.";

export default defineCard({
  name: "Iron Golem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 5,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${EACH_COMBAT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-attack", "must-block"], text: EACH_COMBAT }],
});
