import { defineCard } from "../define.js";
import { provoke } from "../helpers.js";

// EDHREC rank 25921.

export default defineCard({
  name: "Krosan Vorine",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 3,
  toughness: 2,
  text: "Provoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)\nThis creature can't be blocked by more than one creature.",
  triggered: [provoke()],
  static: [
    {
      affects: { scope: "self" },
      blockedByAtMostOne: true,
      text: "This creature can't be blocked by more than one creature.",
    },
  ],
});
