import { defineCard } from "../define.js";

// EDHREC rank 8547.
//
// All damage — combat and noncombat — by any creature, matched as the damage
// would be dealt (rule 615.1).

export default defineCard({
  name: "Ethereal Haze",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Prevent all damage that would be dealt by creatures this turn.",
  effect: { kind: "damage-rule", by: { filter: { type: "creature" } } },
});
