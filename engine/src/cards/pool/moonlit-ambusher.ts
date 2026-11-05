import { defineCard } from "../define.js";

export default defineCard({
  name: "Moonlit Ambusher",
  art: "https://cards.scryfall.io/art_crop/back/8/b/8bcaa944-4e45-457c-be9c-07377b6ed08b.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 3,
  keywords: ["nightbound"],
  text: "Nightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  faces: ["Oakshade Stalker", "Moonlit Ambusher"],
  transform: true,
});
