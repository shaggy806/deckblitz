import { defineCard } from "../define.js";

// EDHREC rank 31869. Hewed Stone Retainers' cast restriction.

export default defineCard({
  name: "Skyshroud Condor",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Cast this spell only if you've cast another spell this turn.\nFlying",
  castOnlyIf: { kind: "cast-this-turn", who: "you", atLeast: 1 },
});
