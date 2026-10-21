import { defineCard } from "../define.js";

// EDHREC rank 21841.
//
// Rulings:
//   [2019-06-14] Saddled Rimestag's effect checks each turn whether it applies during that turn.
//   [2019-06-14] It applies even if the other creature entered the battlefield under your control
//     before Saddled Rimestag entered the battlefield, and it continues to apply even if that
//     creature leaves the battlefield.
//   [2019-06-14] Saddled Rimestag doesn't get more than +2/+2 if you had more than one other
//     creature enter the battlefield under your control during a turn.

export default defineCard({
  name: "Saddled Rimestag",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 2,
  toughness: 2,
  text: "This creature gets +2/+2 as long as you had another creature enter the battlefield under your control this turn.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature" }, excludeSelf: true },
      grantPt: [2, 2],
      text: "This creature gets +2/+2 as long as you had another creature enter the battlefield under your control this turn.",
    },
  ],
});
