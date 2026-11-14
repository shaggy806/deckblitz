import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

export default defineCard({
  name: "Leonardo, Worldly Warrior",
  manaCost: "{7}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 5,
  toughness: 5,
  keywords: ["double-strike"],
  text: "Affinity for creatures (This spell costs {1} less to cast for each creature you control.)\nDouble strike (This creature deals both first-strike and regular combat damage.)",
  selfCostReduction: affinity({ type: "creature" }),
});
