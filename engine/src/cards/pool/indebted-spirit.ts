import { defineCard } from "../define.js";

// EDHREC rank 8659.

const AFTERLIFE = {
  kind: "create-token",
  token: "Spirit Token (White-Black)",
  count: 1,
} as const;

export default defineCard({
  name: "Indebted Spirit",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: "Bestow {2}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nAfterlife 1 (When this permanent is put into a graveyard from the battlefield, create a 1/1 white and black Spirit creature token with flying.)\nEnchanted creature gets +1/+1 and has afterlife 1.",
  bestow: "{2}{W}",
  triggered: [
    {
      // "Put into a graveyard from the battlefield", not "dies": it triggers
      // as an Aura too (the ruling).
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: AFTERLIFE,
      resolve: null,
      text: "Afterlife 1 (When this permanent is put into a graveyard from the battlefield, create a 1/1 white and black Spirit creature token with flying.)",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: AFTERLIFE,
          resolve: null,
          text: "Afterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)",
        },
      ],
      text: "Enchanted creature gets +1/+1 and has afterlife 1.",
    },
  ],
});
