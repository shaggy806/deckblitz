import { defineCard } from "../define.js";

// Every creature you control with menace, this one included, read as blocks
// are declared: one that gains menace later is reached then.
const EVASION = "Each creature you control with menace can't be blocked except by three or more creatures.";

export default defineCard({
  name: "Sonorous Howlbonder",
  manaCost: "{1}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${EVASION}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", keyword: "menace" } },
      blockedByAtLeast: 3,
      text: EVASION,
    },
  ],
});
