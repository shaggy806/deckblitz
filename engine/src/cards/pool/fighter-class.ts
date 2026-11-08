import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel } from "../helpers.js";

// EDHREC rank 2286.
//
// Level 2 takes generic mana only, each Fighter Class its own {2} (the ruling).
// Level 3's requirement is on the one attacker that triggered it; a creature
// required to block more than one chooses which (the ruling).

const ENTERS_TEXT = "When this Class enters, search your library for an Equipment card, reveal it, put it into your hand, then shuffle.";
const COST_TEXT = "Equip abilities you activate cost {2} less to activate.";
const ATTACK_TEXT = "Whenever a creature you control attacks, up to one target creature blocks it this combat if able.";

export default defineCard({
  name: "Fighter Class",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${ENTERS_TEXT}\n{1}{R}{W}: Level 2\n${COST_TEXT}\n{3}{R}{W}: Level 3\n${ATTACK_TEXT}`,
  static: [
    atLevel(2, {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, abilityKind: "equip", byYou: true, reduceGeneric: 2 },
      text: COST_TEXT,
    }),
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Equipment" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    atLevel(3, {
      trigger: { on: "attacks", who: "you-control" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "must-block", attacker: "trigger-object" }], duration: "until-end-of-combat" },
      resolve: null,
      text: ATTACK_TEXT,
    }),
  ],
  activated: [classLevel(2, "{1}{R}{W}"), classLevel(3, "{3}{R}{W}")],
});
