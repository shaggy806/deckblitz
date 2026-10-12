import { defineCard } from "../define.js";

export default defineCard({
  name: "Giltgrove Stalker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 2,
  toughness: 1,
  text: "This creature can't be blocked by creatures with power 2 or less.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
