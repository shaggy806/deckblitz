import { defineCard } from "../define.js";

// EDHREC rank 29161.
const TEXT = "This creature has first strike as long as it's attacking.";

export default defineCard({
  name: "Kor Scythemaster",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier", "Ally"],
  power: 3,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});
