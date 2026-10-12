import { defineCard } from "../define.js";

export default defineCard({
  name: "Elvish Skysweeper",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 1,
  toughness: 1,
  text: "{4}{G}, Sacrifice a creature: Destroy target creature with flying.",
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false, sacrifice: "creature-you-control" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{4}{G}, Sacrifice a creature: Destroy target creature with flying.",
    },
  ],
});
