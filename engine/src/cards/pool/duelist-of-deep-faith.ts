import { defineCard } from "../define.js";

// EDHREC rank 14392.

export default defineCard({
  name: "Duelist of Deep Faith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Soldier"],
  power: 2,
  toughness: 2,
  toxic: 1,
  text: "Toxic 1 (Players dealt combat damage by this creature also get a poison counter.)\nDuring your turn, this creature has first strike.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, this creature has first strike.",
    },
  ],
});
