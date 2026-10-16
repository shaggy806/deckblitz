import { defineCard } from "../define.js";

// EDHREC rank 15832. Rowdy Research's self cost reduction, counting the
// spells the caster's opponents have cast this turn; it reduces only the
// generic part, so never below {U} (the ruling).

const COST_TEXT = "This spell costs {1} less to cast for each spell your opponents have cast this turn.";

export default defineCard({
  name: "Delightful Discovery",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${COST_TEXT}\nScry 2, then draw two cards. (To scry 2, look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "spells-cast", who: "opponent" },
  },
  effect: { kind: "scry", amount: 2, then: { kind: "draw", amount: 2 } },
});
