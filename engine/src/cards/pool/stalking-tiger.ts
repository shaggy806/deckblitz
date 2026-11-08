import { defineCard } from "../define.js";

export default defineCard({
  name: "Stalking Tiger",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  text: "This creature can't be blocked by more than one creature.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }],
      text: "This creature can't be blocked by more than one creature.",
    },
  ],
});
