import { defineCard } from "../define.js";

export default defineCard({
  name: "Gangly Stompling",
  manaCost: "{2}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 2,
  keywords: ["changeling", "trample"],
  text: "Changeling (This card is every creature type.)\nTrample",
});
