import { defineCard } from "../define.js";

const ATTACK = "This creature can't attack if defending player controls an untapped creature with power 3 or greater.";
const BLOCK = "This creature can't block creatures with power 3 or greater.";

export default defineCard({
  name: "Orgg",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orgg"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ATTACK}\n${BLOCK}`,
  static: [
    {
      affects: { scope: "self" },
      cantAttackIfDefender: { controls: { type: "creature", tapped: false, power: { op: "gte", n: 3 } } },
      text: ATTACK,
    },
    { affects: { scope: "self" }, canBlockOnly: { power: { op: "lte", n: 2 } }, text: BLOCK },
  ],
});
