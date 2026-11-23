import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Its rulings: the struck-out words are
// jokes — it has double strike (not flying), and "as long as it's attacking,
// it gets +1/+0 for each red card in your graveyard".

const PUMP_TEXT = "While attacking, this creature gets +10̶0̶0̶ power for each f̶i̶r̶e̶ red card in your graveyard.";

export default defineCard({
  name: "Bolshack Dragon",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Armored", "Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["double-strike"],
  text: `Double b̶r̶e̶a̶k̶e̶r̶ strike\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantPtPerCount: { inGraveyard: { colors: ["R"], ownedBy: "you" }, pt: [1, 0] },
      text: PUMP_TEXT,
    },
  ],
});
