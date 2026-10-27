import { defineCard } from "../define.js";

// EDHREC rank 30323.
//
// Rulings:
//   [2022-12-08] To cast a split card, choose one of its halves to cast. There's no way to cast
//     both halves of this split card.
//   [2022-12-08] A split card's characteristics are a combination of its two halves while it is
//     not on the stack.

const FACES = ["Night // Day", "Night", "Day"];

// The whole card: every zone but the stack (rule 709.4); night.ts, day.ts are
// the halves.
export default defineCard({
  name: "Night // Day",
  manaCost: "{B}{2}{W}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Target creature gets -1/-1 until end of turn.\n//\nCreatures target player controls get +1/+1 until end of turn.",
  faces: FACES,
  split: true,
});
