import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8005.
//
// Rulings:
//   [2014-04-26] If you move Armory of Iroas from one creature to another, any +1/+1 counters on
//     the first creature remain where they are.
//   [2014-04-26] The +1/+1 counter is put on the equipped creature before combat damage is dealt.

const ATTACK_TEXT = "Whenever equipped creature attacks, put a +1/+1 counter on it.";

export default defineCard({
  name: "Armory of Iroas",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACK_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
