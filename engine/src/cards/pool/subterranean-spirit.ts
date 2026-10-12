import { defineCard } from "../define.js";

export default defineCard({
  name: "Subterranean Spirit",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 3,
  toughness: 3,
  text: "Protection from red\n{T}: This creature deals 1 damage to each creature without flying.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to each creature without flying.",
    },
  ],
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
