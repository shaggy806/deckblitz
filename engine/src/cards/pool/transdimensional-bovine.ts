import { defineCard } from "../define.js";

export default defineCard({
  name: "Transdimensional Bovine",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ox", "Avatar"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{T}: Add two mana of any one color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 2 },
      resolve: null,
      text: "{T}: Add two mana of any one color.",
    },
  ],
});
