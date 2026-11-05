import { defineCard } from "../define.js";

// EDHREC rank 25107.

export default defineCard({
  name: "Pride of Lions",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 4,
  toughness: 4,
  text: "You may have this creature assign its combat damage as though it weren't blocked.",
  static: [
    {
      affects: { scope: "self" },
      assignAsThoughUnblocked: true,
      text: "You may have this creature assign its combat damage as though it weren't blocked.",
    },
  ],
});
