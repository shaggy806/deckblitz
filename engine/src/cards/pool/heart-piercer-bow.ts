import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 19178. The Bow, not the equipped creature, is the source of the
// trigger and of the damage (the ruling) — the ability's own source. The
// defending player is the attack trigger's player (Thunder Lasso's shape).

const ATTACK_TEXT =
  "Whenever equipped creature attacks, this Equipment deals 1 damage to target creature defending player controls.";

export default defineCard({
  name: "Heart-Piercer Bow",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACK_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [equip("{1}")],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
