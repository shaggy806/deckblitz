import { defineCard } from "../define.js";

// EDHREC rank 13888.

export default defineCard({
  name: "Kestia, the Cultivator",
  manaCost: "{1}{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 4,
  toughness: 4,
  text: "Bestow {3}{G}{W}{U} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nEnchanted creature gets +4/+4.\nWhenever an enchanted creature or enchantment creature you control attacks, draw a card.",
  bestow: "{3}{G}{W}{U}",
  static: [{ affects: { scope: "attached" }, grantPt: [4, 4], text: "Enchanted creature gets +4/+4." }],
  triggered: [
    {
      // Once per attacker: an enchanted enchantment creature draws one card (the ruling).
      trigger: {
        on: "attacks",
        who: "you-control",
        filter: { type: "creature", anyOf: [{ enchanted: true }, { type: "enchantment" }] },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever an enchanted creature or enchantment creature you control attacks, draw a card.",
    },
  ],
});
