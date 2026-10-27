import { defineCard } from "../define.js";

// EDHREC rank 26165. "Can't block creatures with power 2 or greater" is
// "can block only creatures with power 1 or less".

const TEXT = "This creature can't block or be blocked by creatures with power 2 or greater.";

export default defineCard({
  name: "Sneaky Homunculus",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus", "Illusion"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 2 } },
      canBlockOnly: { power: { op: "lte", n: 1 } },
      text: TEXT,
    },
  ],
});
