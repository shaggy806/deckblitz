import { defineCard } from "../define.js";

// Adventures in the Forgotten Realms Commander. The anthem asks whether
// you've ever completed a dungeon, whether or not Nadaar was there (its
// ruling).
const VENTURE_TEXT = "Whenever Nadaar enters or attacks, venture into the dungeon.";

export default defineCard({
  name: "Nadaar, Selfless Paladin",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever Nadaar enters or attacks, venture into the dungeon. (Enter the first room or advance to the next room.)\nOther creatures you control get +1/+1 as long as you've completed a dungeon.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: VENTURE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: VENTURE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: { kind: "completed-dungeon" },
      grantPt: [1, 1],
      text: "Other creatures you control get +1/+1 as long as you've completed a dungeon.",
    },
  ],
});
