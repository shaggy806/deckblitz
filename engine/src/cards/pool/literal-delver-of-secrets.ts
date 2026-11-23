import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Delve (rule 702.66).

export default defineCard({
  name: "Literal Delver of Secrets",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Insect"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  delve: true,
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for 1 generic mana.)\nFlying",
});
