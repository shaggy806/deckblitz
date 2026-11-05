import { defineCard } from "../define.js";

const TAP_TEXT =
  "Tap enchanted creature: Target creature other than the creature tapped this way gets +2/+1 until end of turn. Activate only if enchanted creature is untapped.";

export default defineCard({
  name: "Veteran's Voice",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${TAP_TEXT}`,
  targets: ["creature-you-control"],
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { hostOfSource: true } } },
      targets: [{ kind: "other", of: "creature", than: "host" }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
