import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

const ATTACK = "Whenever this creature attacks, it deals 6 damage to each creature defending player controls.";

export default defineCard({
  name: "Lord of Shatterskull Pass",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 3,
  toughness: 3,
  text: `Level up {1}{R} ({1}{R}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-5\n6/6\nLEVEL 6+\n6/6\n${ATTACK}`,
  activated: [levelUp("{1}{R}")],
  static: [levelStatic(levelBand(1, 5), 6, 6, "LEVEL 1-5\n6/6"), levelStatic(levelBand(6), 6, 6, "LEVEL 6+\n6/6")],
  triggered: [
    {
      // Printed in the LEVEL 6+ band: the ability exists only while leveled.
      // Swathcutter Giant's shape: only the player it's attacking (the
      // rulings), the defending player being the trigger's player.
      trigger: { on: "attacks", who: "self" },
      whileCondition: levelBand(6),
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 6, whose: "trigger-player" },
      resolve: null,
      text: ATTACK,
    },
  ],
});
