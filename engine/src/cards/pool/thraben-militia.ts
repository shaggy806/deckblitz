import { defineCard } from "../define.js";

export default defineCard({
  name: "Thraben Militia",
  art: "https://cards.scryfall.io/art_crop/back/5/8/58ae9cbc-d88d-42df-ab76-63ab5d05c023.jpg",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample",
  faces: ["Thraben Sentry", "Thraben Militia"],
  transform: true,
});
