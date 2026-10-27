import { defineCard } from "../define.js";

export default defineCard({
  name: "Nantuko Calmer",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 2,
  toughness: 3,
  text: "{G}, {T}, Sacrifice this creature: Destroy target enchantment.\nThreshold — This creature gets +1/+1 as long as there are seven or more cards in your graveyard.",
  activated: [
    {
      cost: { mana: "{G}", tap: true, sacrifice: "self" },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{G}, {T}, Sacrifice this creature: Destroy target enchantment.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      text: "Threshold — This creature gets +1/+1 as long as there are seven or more cards in your graveyard.",
    },
  ],
});
