import { defineCard } from "../define.js";

export default defineCard({
  name: "Duskmantle Operative",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: "This creature can't be blocked by creatures with power 4 or greater.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 4 } },
      text: "This creature can't be blocked by creatures with power 4 or greater.",
    },
  ],
});
