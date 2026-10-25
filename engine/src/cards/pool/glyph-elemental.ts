import { defineCard } from "../define.js";

// EDHREC rank 10191.

export default defineCard({
  name: "Glyph Elemental",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: "Bestow {1}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nLandfall — Whenever a land you control enters, put a +1/+1 counter on this permanent.\nEnchanted creature gets +1/+1 for each +1/+1 counter on this Aura.",
  bestow: "{1}{W}",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, put a +1/+1 counter on this permanent.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "+1/+1", pt: [1, 1] },
      text: "Enchanted creature gets +1/+1 for each +1/+1 counter on this Aura.",
    },
  ],
});
