import { defineCard } from "../define.js";

// EDHREC rank 10481.
//
// Rulings:
//   [2025-11-17] Because damage remains marked on creatures until the damage is removed as the
//     turn ends, nonlethal damage dealt to Moon-Vigil Adherents may become lethal if the number of
//     creatures you control or creature cards in your graveyard changes.
//
// Two counts, each a +1/+1 per member — the creatures you control (this one
// included) and the creature cards in your graveyard — read live, so the
// bonus follows both as they change (the ruling). Multani's shape.

const PT_TEXT = "This creature gets +1/+1 for each creature you control and each creature card in your graveyard.";

export default defineCard({
  name: "Moon-Vigil Adherents",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 1] },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { type: "creature", ownedBy: "you" }, pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
});
