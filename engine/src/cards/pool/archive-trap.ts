import { defineCard } from "../define.js";

export default defineCard({
  name: "Archive Trap",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent searched their library this turn, you may pay {0} rather than pay this spell's mana cost.\nTarget opponent mills thirteen cards.",
  freeCastIf: { condition: { kind: "turn-stat", stat: "own-library-searched", who: "opponent", atLeast: 1 } },
  targets: ["opponent"],
  effect: { kind: "mill", target: 0, amount: 13 },
});
