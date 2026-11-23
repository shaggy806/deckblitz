import { defineCard } from "../define.js";

// Playtest card. Nothing here taps it (the ruling): another card turns the key.

export default defineCard({
  name: "Corrupted Key",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Key"],
  text: "As long as Corrupted Key is tapped, creatures you control have menace and deathtouch.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "source", filter: { tapped: true } },
      grantKeywords: ["menace", "deathtouch"],
      text: "As long as Corrupted Key is tapped, creatures you control have menace and deathtouch.",
    },
  ],
});
