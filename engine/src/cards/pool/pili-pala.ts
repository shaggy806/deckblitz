import { defineCard } from "../define.js";

// EDHREC rank 5601.

export default defineCard({
  name: "Pili-Pala",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{2}, {Q}: Add one mana of any color. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false, untap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{2}, {Q}: Add one mana of any color.",
    },
  ],
});
