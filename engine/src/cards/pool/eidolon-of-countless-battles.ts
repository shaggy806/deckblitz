import { defineCard } from "../define.js";

// EDHREC rank 3450.

const TEXT =
  "This creature and enchanted creature each get +1/+1 for each creature you control and +1/+1 for each Aura you control.";

// A bestow permanent is a creature or an Aura, never both, so it counts once
// (the ruling): the two counts are separate statics.
export default defineCard({
  name: "Eidolon of Countless Battles",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: `Bestow {2}{W}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${TEXT}`,
  bestow: "{2}{W}{W}",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 1] },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Aura", controlledBy: "you" }, pt: [1, 1] },
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 1] },
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Aura", controlledBy: "you" }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
