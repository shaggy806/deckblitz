import { defineCard } from "../define.js";

export default defineCard({
  name: "Unimpeded Trespasser",
  art: "https://cards.scryfall.io/art_crop/back/4/d/4dea7c9f-ce66-447b-9f1b-d9bca5806153.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "This creature can't be blocked.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
  faces: ["Uninvited Geist", "Unimpeded Trespasser"],
  transform: true,
});
