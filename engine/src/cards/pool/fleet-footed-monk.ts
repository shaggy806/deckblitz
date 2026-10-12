import { defineCard } from "../define.js";

export default defineCard({
  name: "Fleet-Footed Monk",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 1,
  text: "This creature can't be blocked by creatures with power 2 or greater.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or greater.",
    },
  ],
});
