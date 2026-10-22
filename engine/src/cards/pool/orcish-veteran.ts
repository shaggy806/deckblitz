import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 31973.
//
// "Can't block white creatures with power 2 or greater" is "can block only creatures that are
// nonwhite or have power 1 or less" (rule 509.1b), checked as blocks are declared.
const NO_BLOCK = "This creature can't block white creatures with power 2 or greater.";
const FIRST_STRIKE = "{R}: This creature gains first strike until end of turn.";

export default defineCard({
  name: "Orcish Veteran",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 2,
  toughness: 2,
  text: `${NO_BLOCK}\n${FIRST_STRIKE}`,
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { anyOf: [{ notColors: ["W"] }, { power: { op: "lte", n: 1 } }] },
      text: NO_BLOCK,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: FIRST_STRIKE,
    },
  ],
});
