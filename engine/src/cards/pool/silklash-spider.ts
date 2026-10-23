import { defineCard } from "../define.js";

export default defineCard({
  name: "Silklash Spider",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 7,
  keywords: ["reach"],
  text: "Reach\n{X}{G}{G}: This creature deals X damage to each creature with flying.",
  activated: [
    {
      cost: { mana: "{X}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: "x" },
      resolve: null,
      text: "{X}{G}{G}: This creature deals X damage to each creature with flying.",
    },
  ],
});
