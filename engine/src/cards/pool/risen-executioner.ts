import { defineCard } from "../define.js";

const LORD_TEXT = "Other Zombie creatures you control get +1/+1.";
const CAST_TEXT =
  "You may cast this creature from your graveyard if you pay {1} more to cast it for each other creature card in your graveyard.";

// The increase is counted as the cost is determined (rule 601.2f), when no
// one can respond (its ruling); the timing is a creature's as ever.
export default defineCard({
  name: "Risen Executioner",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 4,
  toughness: 3,
  text: `This creature can't block.\n${LORD_TEXT}\n${CAST_TEXT}`,
  static: [
    { affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." },
    {
      affects: { scope: "creatures-you-control", subtype: "Zombie", excludeSelf: true },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  mayPlaySelf: { from: ["graveyard"], costIncreasePerOther: { type: "creature" } },
});
