import { defineCard } from "../define.js";

export default defineCard({
  name: "Wrathful Jailbreaker",
  art: "https://cards.scryfall.io/art_crop/back/e/6/e641467b-ac2e-4d29-aed7-5cc227c3b1ce.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 6,
  keywords: ["nightbound"],
  text: "This creature attacks each combat if able.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
  faces: ["Weary Prisoner", "Wrathful Jailbreaker"],
  transform: true,
});
