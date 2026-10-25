import { defineCard } from "../define.js";

// EDHREC rank 9937. Eldritch Moon.
//
// The cast trigger resolves before Decimator enters, so it doesn't pump
// itself (the rulings).

export default defineCard({
  name: "Decimator of the Provinces",
  manaCost: "{10}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Boar"],
  power: 7,
  toughness: 7,
  keywords: ["trample", "haste"],
  alternativeCost: { mana: "{6}{G}{G}{G}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Emerge {6}{G}{G}{G} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, creatures you control get +2/+2 and gain trample until end of turn.\nTrample, haste",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When you cast this spell, creatures you control get +2/+2 and gain trample until end of turn.",
    },
  ],
});
