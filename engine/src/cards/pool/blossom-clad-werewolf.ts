import { defineCard } from "../define.js";

export default defineCard({
  name: "Blossom-Clad Werewolf",
  art: "https://cards.scryfall.io/art_crop/back/7/3/73bf2a0a-b97d-4b90-abd6-d1755734ea15.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 4,
  keywords: ["nightbound"],
  text: "{T}: Add two mana of any one color.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 2 },
      resolve: null,
      text: "{T}: Add two mana of any one color.",
    },
  ],
  faces: ["Weaver of Blossoms", "Blossom-Clad Werewolf"],
  transform: true,
});
