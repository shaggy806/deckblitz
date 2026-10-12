import { defineCard } from "../define.js";

export default defineCard({
  name: "Changeling Sentinel",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 2,
  keywords: ["changeling", "vigilance"],
  text: "Changeling (This card is every creature type.)\nVigilance",
});
