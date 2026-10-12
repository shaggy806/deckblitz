import { defineCard } from "../define.js";

export default defineCard({
  name: "Visara the Dreadful",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\n{T}: Destroy target creature. It can't be regenerated.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "{T}: Destroy target creature. It can't be regenerated.",
    },
  ],
});
