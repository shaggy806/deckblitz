import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV).

export default defineCard({
  name: "Gate Hound",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
  text: "Creatures you control have vigilance as long as this creature is enchanted.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "source", filter: { enchanted: true } },
      grantKeywords: ["vigilance"],
      text: "Creatures you control have vigilance as long as this creature is enchanted.",
    },
  ],
});
