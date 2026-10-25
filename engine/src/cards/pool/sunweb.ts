import { defineCard } from "../define.js";

// EDHREC rank 25218. Brassclaw Orcs' block restriction, the other way round.

export default defineCard({
  name: "Sunweb",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 5,
  toughness: 6,
  keywords: ["defender", "flying"],
  text: "Defender (This creature can't attack.)\nFlying\nThis creature can't block creatures with power 2 or less.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { power: { op: "gte", n: 3 } },
      text: "This creature can't block creatures with power 2 or less.",
    },
  ],
});
