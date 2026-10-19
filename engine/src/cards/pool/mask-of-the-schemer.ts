import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "It" is the equipped creature that dealt the damage (the trigger object),
// and X the damage it dealt that player. A creature that has left by then
// still connives — its last controller draws and discards — with no counter
// (rule 701.50b, the rulings).
const DAMAGE_TEXT =
  "Whenever equipped creature deals combat damage to a player, it connives X, where X is the amount of damage it dealt to that player. (Draw X cards, then discard X cards. Put a +1/+1 counter on that creature for each nonland card discarded this way.)";

export default defineCard({
  name: "Mask of the Schemer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${DAMAGE_TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "connive", target: "trigger-object", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
