import { defineCard } from "../define.js";

export default defineCard({
  name: "Sureshot Sower",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 3,
  toughness: 1,
  keywords: ["reach"],
  text: "Reach\n{3}{G}, Discard this card: Destroy target creature with flying.",
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{3}{G}, Discard this card: Destroy target creature with flying.",
      zone: "hand",
    },
  ],
});
