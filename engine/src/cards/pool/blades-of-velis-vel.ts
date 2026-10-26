import { defineCard } from "../define.js";

// Changeling on a kindred instant (rules 205.3m, 702.73a), as Crib Swap.
// "Gain all creature types" is the `(every creature type)` subtype, as
// Glamer Gifter and Oko, Lorwyn Liege.
export default defineCard({
  name: "Blades of Velis Vel",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["kindred", "instant"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\nUp to two target creatures each get +2/+0 and gain all creature types until end of turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "add-types", target: 0, addSubtypes: ["(every creature type)"], duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "add-types", target: 1, addSubtypes: ["(every creature type)"], duration: "end-of-turn" },
    ],
  },
});
