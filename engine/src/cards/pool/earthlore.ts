import { defineCard } from "../define.js";

// "Tap enchanted land" is a cost (`tapOthers` of the host), not the {T} of rule
// 302.6; it can't be paid with the land tapped already (rule 118.3), which is
// all "activate only if enchanted land is untapped" asks.
export default defineCard({
  name: "Earthlore",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land you control\nTap enchanted land: Target blocking creature gets +1/+2 until end of turn. Activate only if enchanted land is untapped.",
  targets: [{ kind: "permanent", whose: "you", filter: { type: "land" } }],
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { hostOfSource: true } } },
      targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Tap enchanted land: Target blocking creature gets +1/+2 until end of turn. Activate only if enchanted land is untapped.",
    },
  ],
});
