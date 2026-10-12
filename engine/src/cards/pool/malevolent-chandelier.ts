import { defineCard } from "../define.js";

export default defineCard({
  name: "Malevolent Chandelier",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{2}: Put target card from a graveyard on the bottom of its owner's library. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{2}: Put target card from a graveyard on the bottom of its owner's library. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
