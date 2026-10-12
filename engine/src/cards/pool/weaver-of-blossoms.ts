import { defineCard } from "../define.js";

export default defineCard({
  name: "Weaver of Blossoms",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 3,
  keywords: ["daybound"],
  text: "{T}: Add one mana of any color.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  faces: ["Weaver of Blossoms", "Blossom-Clad Werewolf"],
  transform: true,
});
