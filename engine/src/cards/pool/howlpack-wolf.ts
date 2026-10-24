import { defineCard } from "../define.js";

export default defineCard({
  name: "Howlpack Wolf",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 3,
  text: "This creature can't block unless you control another Wolf or Werewolf.",
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { subtypes: ["Wolf", "Werewolf"] }, atLeast: 1, excludeSelf: true },
      },
      restrictions: ["cant-block"],
      text: "This creature can't block unless you control another Wolf or Werewolf.",
    },
  ],
});
