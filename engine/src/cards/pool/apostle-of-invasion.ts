import { defineCard } from "../define.js";

// EDHREC rank 18666.
// Corrupted is a live static condition: with every poisoned opponent gone
// after first-strike damage, it has no double strike for the regular step
// (the ruling) — combat reads its keywords as each step begins.

const CORRUPTED = "Corrupted — As long as an opponent has three or more poison counters, this creature has double strike.";

export default defineCard({
  name: "Apostle of Invasion",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${CORRUPTED}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      grantKeywords: ["double-strike"],
      text: CORRUPTED,
    },
  ],
});
