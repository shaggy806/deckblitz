import { defineCard } from "../define.js";

// EDHREC rank 15334.

export default defineCard({
  name: "Stoic Angel",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nPlayers can't untap more than one creature during their untap steps.",
  static: [
    {
      affects: { scope: "self" },
      untapLimit: { who: "each-player", count: 1, filter: { type: "creature" } },
      text: "Players can't untap more than one creature during their untap steps.",
    },
  ],
});
