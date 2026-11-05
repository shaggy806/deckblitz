import { defineCard } from "../define.js";

// EDHREC rank 31376.

const CANT_ATTACK = "This creature can't attack if defending player controls an untapped creature with power 3 or greater.";
const CANT_BLOCK = "This creature can't block creatures with power 3 or greater.";

export default defineCard({
  name: "Goblin Mutant",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Mutant"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${CANT_ATTACK}\n${CANT_BLOCK}`,
  static: [
    {
      affects: { scope: "self" },
      cantAttackIfDefender: { controls: { type: "creature", tapped: false, power: { op: "gte", n: 3 } } },
      text: CANT_ATTACK,
    },
    { affects: { scope: "self" }, canBlockOnly: { power: { op: "lte", n: 2 } }, text: CANT_BLOCK },
  ],
});
