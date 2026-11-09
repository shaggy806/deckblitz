import { defineCard } from "../define.js";

export default defineCard({
  name: "Angel of Jubilation",
  manaCost: "{1}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nOther nonblack creatures you control get +1/+1.\nPlayers can't pay life or sacrifice creatures to cast spells or activate abilities.",
  static: [
    { affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", notColors: ["B"] }, excludeSelf: true }, grantPt: [1, 1], text: "Other nonblack creatures you control get +1/+1." },
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "pay-life", who: "each-player" },
        { act: "sacrifice-for-cost", who: "each-player", filter: { type: "creature" } },
      ],
      text: "Players can't pay life or sacrifice creatures to cast spells or activate abilities.",
    },
  ],
});
