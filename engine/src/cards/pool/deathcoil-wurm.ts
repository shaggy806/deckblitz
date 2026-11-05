import { defineCard } from "../define.js";

// EDHREC rank 21179.

export default defineCard({
  name: "Deathcoil Wurm",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 6,
  text: "You may have this creature assign its combat damage as though it weren't blocked.",
  static: [
    {
      affects: { scope: "self" },
      assignAsThoughUnblocked: true,
      text: "You may have this creature assign its combat damage as though it weren't blocked.",
    },
  ],
});
