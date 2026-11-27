import { defineCard } from "../define.js";

// EDHREC rank 25429.

const REACH_TEXT = "This creature can block Dragons as though it had reach.";

export default defineCard({
  name: "Dragon Hunter",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: `Protection from Dragons\n${REACH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Dragon" } },
      text: "Protection from Dragons",
    },
    { affects: { scope: "self" }, blocksAsThoughReach: { subtype: "Dragon" }, text: REACH_TEXT },
  ],
});
