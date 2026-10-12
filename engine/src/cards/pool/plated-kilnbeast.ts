import { defineCard } from "../define.js";

export default defineCard({
  name: "Plated Kilnbeast",
  art: "https://cards.scryfall.io/art_crop/back/6/1/61972ddb-3421-4f22-a47a-89cea944dd02.jpg",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 7,
  toughness: 5,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)",
  faces: ["Bonded Herdbeast", "Plated Kilnbeast"],
  transform: true,
});
