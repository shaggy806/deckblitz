import { defineCard } from "../define.js";
import { equip, livingWeapon } from "../helpers.js";

// EDHREC rank 7390. Half the player's life as the ability resolves, after the
// combat damage (the ruling) — Quietus Spike's trigger.
const DAMAGE_TEXT =
  "Whenever equipped creature deals combat damage to a player, that player loses half their life, rounded up.";

export default defineCard({
  name: "Scytheclaw",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\nEquipped creature gets +1/+1.\n${DAMAGE_TEXT}\nEquip {3}`,
  activated: [equip("{3}")],
  triggered: [
    livingWeapon(),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
});
