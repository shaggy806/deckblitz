import { defineCard } from "../define.js";

export default defineCard({
  name: "Ashen Firebeast",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Beast"],
  power: 6,
  toughness: 6,
  text: "{1}{R}: This creature deals 1 damage to each creature without flying.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      resolve: null,
      text: "{1}{R}: This creature deals 1 damage to each creature without flying.",
    },
  ],
});
