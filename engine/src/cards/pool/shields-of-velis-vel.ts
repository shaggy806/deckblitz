import { defineCard } from "../define.js";

export default defineCard({
  name: "Shields of Velis Vel",
  manaCost: "{W}",
  colors: ["W"],
  types: ["kindred", "instant"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\nCreatures target player controls get +0/+1 and gain all creature types until end of turn.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0, power: 0, toughness: 1, duration: "end-of-turn" },
      { kind: "become", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0, addSubtypes: ["(every creature type)"], duration: "end-of-turn" },
    ],
  },
});
