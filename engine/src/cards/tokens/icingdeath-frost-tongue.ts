import { defineCard } from "../define.js";

/**
 * Icingdeath, Frost Tyrant's dies token — "Icingdeath, Frost Tongue, a
 * legendary white Equipment artifact token with 'Equipped creature gets
 * +2/+0,' 'Whenever equipped creature attacks, tap target creature defending
 * player controls,' and equip {2}."
 *
 * A named legendary token (Cragflame's shape), keyed by its own name so the
 * legend rule reads it. The attack trigger is Thunder Lasso's: the defending
 * player is the trigger's player.
 */
const PUMP_TEXT = "Equipped creature gets +2/+0.";
const ATTACK_TEXT = "Whenever equipped creature attacks, tap target creature defending player controls.";

export default defineCard({
  name: "Icingdeath, Frost Tongue",
  art: "a9c981c9-3376-4f6e-b30d-859e5fc7347e",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${ATTACK_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
