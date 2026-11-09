import { defineCard } from "../define.js";

export default defineCard({
  name: "Ego Erasure",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["kindred", "instant"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\nCreatures target player controls get -2/-0 and lose all creature types until end of turn.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      { kind: "become", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0, loseCreatureTypes: true, duration: "end-of-turn" },
    ],
  },
});
