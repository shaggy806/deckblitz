import { defineCard } from "../define.js";

export default defineCard({
  name: "Ixalli's Keeper",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{7}{G}, {T}, Sacrifice this creature: Target creature gets +5/+5 and gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{7}{G}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{7}{G}, {T}, Sacrifice this creature: Target creature gets +5/+5 and gains trample until end of turn.",
    },
  ],
});
