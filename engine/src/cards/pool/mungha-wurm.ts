import { defineCard } from "../define.js";

const TEXT = "You can't untap more than one land during your untap step.";

export default defineCard({
  name: "Mungha Wurm",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      untapLimit: { who: "you", count: 1, filter: { type: "land" } },
      text: TEXT,
    },
  ],
});
