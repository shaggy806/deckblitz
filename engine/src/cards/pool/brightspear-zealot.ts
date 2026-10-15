import { defineCard } from "../define.js";

// Rulings:
//   It counts any spells you've cast this turn, which may include this
//   creature itself, whether they resolved, were countered, or are still on
//   the stack (`cast-this-turn`, each read as it was cast).

const TEXT = "This creature gets +2/+0 as long as you've cast two or more spells this turn.";

export default defineCard({
  name: "Brightspear Zealot",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 2 },
      grantPt: [2, 0],
      text: TEXT,
    },
  ],
});
