import { defineCard } from "../define.js";

// EDHREC rank 27280.

export default defineCard({
  name: "Crystalline Nautilus",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Nautilus"],
  power: 4,
  toughness: 4,
  text: "Bestow {3}{U}{U} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nWhen this permanent becomes the target of a spell or ability, sacrifice it.\nEnchanted creature gets +4/+4 and has \"When this creature becomes the target of a spell or ability, sacrifice it.\"",
  bestow: "{3}{U}{U}",
  // Whether it's a creature or an Aura (the ruling).
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When this permanent becomes the target of a spell or ability, sacrifice it.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 4],
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self" },
          targets: [],
          effect: { kind: "sacrifice-source" },
          resolve: null,
          text: "When this creature becomes the target of a spell or ability, sacrifice it.",
        },
      ],
      text: "Enchanted creature gets +4/+4 and has \"When this creature becomes the target of a spell or ability, sacrifice it.\"",
    },
  ],
});
