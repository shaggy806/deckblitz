import { defineCard } from "../define.js";

// EDHREC rank 24513.
//
// Rulings:
//   [2020-08-07] Weapons Trainer's ability applies even if the Equipment you control isn't
//     attached to any creature.
//   [2020-08-07] Weapons Trainer's ability gives just +1/+0, no matter how many Equipment you
//     control beyond the first.

const TEXT = "Other creatures you control get +1/+0 as long as you control an Equipment.";

export default defineCard({
  name: "Weapons Trainer",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      condition: { kind: "controls", filter: { subtype: "Equipment" }, atLeast: 1 },
      grantPt: [1, 0],
      text: TEXT,
    },
  ],
});
