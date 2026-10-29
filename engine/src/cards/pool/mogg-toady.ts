import { defineCard } from "../define.js";

const ATTACK = "This creature can't attack unless you control more creatures than defending player.";
const BLOCK = "This creature can't block unless you control more creatures than attacking player.";

export default defineCard({
  name: "Mogg Toady",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: `${ATTACK}\n${BLOCK}`,
  static: [
    { affects: { scope: "self" }, cantAttackUnlessDefender: { youControlMore: { type: "creature" } }, text: ATTACK },
    { affects: { scope: "self" }, cantBlockUnlessAttacker: { youControlMore: { type: "creature" } }, text: BLOCK },
  ],
});
