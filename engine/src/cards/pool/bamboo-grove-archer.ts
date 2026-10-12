import { defineCard } from "../define.js";

export default defineCard({
  name: "Bamboo Grove Archer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Snake", "Archer"],
  power: 3,
  toughness: 3,
  keywords: ["defender", "reach"],
  text: "Defender, reach\nChannel — {4}{G}, Discard this card: Destroy target creature with flying.",
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Channel — {4}{G}, Discard this card: Destroy target creature with flying.",
      zone: "hand",
    },
  ],
});
