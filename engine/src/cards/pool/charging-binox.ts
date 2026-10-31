import { defineCard } from "../define.js";

// Battlebond. Assist (rule 702.132a): as it's cast, its caster may choose
// another player, who may pay any of the generic mana in its total cost.
export default defineCard({
  name: "Charging Binox",
  manaCost: "{7}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 5,
  keywords: ["trample"],
  text: "Assist (Another player can pay up to {7} of this spell's cost.)\nTrample",
  assist: true,
});
