import { defineCard } from "../define.js";

// Each is asked of the player that one attack or block involves (rules 506.2,
// 508.1c, 509.1b), so at a table of four it may attack one opponent and not another.
const ATTACK = "This creature can't attack unless you control more lands than defending player.";
const BLOCK = "This creature can't block unless you control more lands than attacking player.";

export default defineCard({
  name: "Monstrous Hound",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 4,
  toughness: 4,
  text: `${ATTACK}\n${BLOCK}`,
  static: [
    { affects: { scope: "self" }, cantAttackUnlessDefender: { youControlMore: { type: "land" } }, text: ATTACK },
    { affects: { scope: "self" }, cantBlockUnlessAttacker: { youControlMore: { type: "land" } }, text: BLOCK },
  ],
});
