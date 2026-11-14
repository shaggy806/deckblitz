import { defineCard } from "../define.js";

// "Each creature that attacked this turn" is every creature declared as an
// attacker this turn, whoever's (Rowdy Research's `"attackers"` turn stat).
const COST_TEXT = "This spell costs {1} less to cast for each creature that attacked this turn.";

export default defineCard({
  name: "The Mary Janes",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bard", "Performer"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `${COST_TEXT}\nMenace (This creature can't be blocked except by two or more creatures.)`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "attackers", who: "each-player" },
  },
});
