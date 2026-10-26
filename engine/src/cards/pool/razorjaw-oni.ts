import { defineCard } from "../define.js";

export default defineCard({
  name: "Razorjaw Oni",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 4,
  toughness: 5,
  text: "Black creatures can't block.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"] } },
      restrictions: ["cant-block"],
      text: "Black creatures can't block.",
    },
  ],
});
