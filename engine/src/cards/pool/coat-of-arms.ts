import { defineCard } from "../define.js";

// EDHREC rank 956. Each creature by its own count: the others that share a
// creature type with it.
export default defineCard({
  name: "Coat of Arms",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "Each creature gets +1/+1 for each other creature on the battlefield that shares at least one creature type with it. (For example, if two Goblin Warriors and a Goblin Shaman are on the battlefield, each gets +2/+2.)",
  static: [
    {
      affects: { scope: "all-creatures" },
      grantPtPerCount: {
        filter: { type: "creature" },
        sharesCreatureTypeWithAffected: true,
        relativeToAffected: true,
        excludeSelf: true,
        pt: [1, 1],
      },
      text: "Each creature gets +1/+1 for each other creature on the battlefield that shares at least one creature type with it.",
    },
  ],
});
