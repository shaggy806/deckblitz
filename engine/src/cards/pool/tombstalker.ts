import { defineCard } from "../define.js";

export default defineCard({
  name: "Tombstalker",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  delve: true,
  text: "Flying\nDelve (Each card you exile from your graveyard while casting this spell pays for {1}.)",
});
