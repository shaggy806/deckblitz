import { defineCard } from "../define.js";

// EDHREC rank 21456.

export default defineCard({
  name: "Empyrial Archangel",
  manaCost: "{4}{G}{W}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 8,
  keywords: ["flying", "shroud"],
  text: "Flying\nShroud (This creature can't be the target of spells or abilities.)\nAll damage that would be dealt to you is dealt to this creature instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", redirect: "self" },
      text: "All damage that would be dealt to you is dealt to this creature instead.",
    },
  ],
});
