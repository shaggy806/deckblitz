import { defineCard } from "../define.js";

// Portal. EDHREC rank 30886.
export default defineCard({
  name: "Ironhoof Ox",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ox"],
  power: 4,
  toughness: 4,
  text: "This creature can't be blocked by more than one creature.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }],
      text: "This creature can't be blocked by more than one creature.",
    },
  ],
});
