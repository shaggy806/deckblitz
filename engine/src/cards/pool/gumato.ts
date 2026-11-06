import { defineCard } from "../define.js";

export default defineCard({
  name: "Gumato",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape", "Beast"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\n{T}: Add {G}{G}{G}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 3 },
      resolve: null,
      text: "{T}: Add {G}{G}{G}.",
    },
  ],
});
