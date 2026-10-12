import { defineCard } from "../define.js";

export default defineCard({
  name: "Krark-Clan Shaman",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: "Sacrifice an artifact: This creature deals 1 damage to each creature without flying.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      resolve: null,
      text: "Sacrifice an artifact: This creature deals 1 damage to each creature without flying.",
    },
  ],
});
