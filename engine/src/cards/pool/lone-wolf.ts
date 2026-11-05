import { defineCard } from "../define.js";

// EDHREC rank 21092.

export default defineCard({
  name: "Lone Wolf",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: "You may have this creature assign its combat damage as though it weren't blocked.",
  static: [
    {
      affects: { scope: "self" },
      assignAsThoughUnblocked: true,
      text: "You may have this creature assign its combat damage as though it weren't blocked.",
    },
  ],
});
