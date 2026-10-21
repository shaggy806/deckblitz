import { defineCard } from "../define.js";

export default defineCard({
  name: "Gilt-Leaf's Embrace",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nWhen this Aura enters, enchanted creature gains trample and indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it. If its toughness is 0 or less, it still dies.)\nEnchanted creature gets +2/+0.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword",
            target: "attached",
            keyword: "trample",
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "attached",
            keyword: "indestructible",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "When this Aura enters, enchanted creature gains trample and indestructible until end of turn.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Enchanted creature gets +2/+0." }],
});
