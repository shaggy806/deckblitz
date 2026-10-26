import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 10297.

export default defineCard({
  name: "Corrosive Mentor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Rogue"],
  power: 1,
  toughness: 3,
  text: "Black creatures you control have wither. (They deal damage to creatures in the form of -1/-1 counters.)",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"], controlledBy: "you" } },
      grantKeywords: ["wither"],
      text: "Black creatures you control have wither.",
    },
  ],
});
