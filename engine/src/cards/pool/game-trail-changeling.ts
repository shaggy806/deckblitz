import { defineCard } from "../define.js";

export default defineCard({
  name: "Game-Trail Changeling",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 4,
  keywords: ["changeling", "trample"],
  text: "Changeling (This card is every creature type.)\nTrample",
});
