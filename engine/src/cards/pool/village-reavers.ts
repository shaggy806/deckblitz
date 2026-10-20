import { defineCard } from "../define.js";

// The nightbound face of Village Watch. "Wolves and Werewolves you control"
// includes itself (Nightpack Ambusher's filter, without its "other").

export default defineCard({
  name: "Village Reavers",
  art: "https://cards.scryfall.io/art_crop/back/1/b/1bf48d2b-eb68-4f47-a80a-4751a4fa20a7.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 4,
  keywords: ["nightbound"],
  text: "Wolves and Werewolves you control have haste.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
      },
      grantKeywords: ["haste"],
      text: "Wolves and Werewolves you control have haste.",
    },
  ],
  faces: ["Village Watch", "Village Reavers"],
  transform: true,
});
