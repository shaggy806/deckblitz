import { defineCard } from "../define.js";

// EDHREC rank 15739.
//
// Both "with toughness greater than its power" abilities are judged on each
// creature's P/T where they're read: combat damage as it's sized, station as
// the station ability resolves (a tapped creature that left is read as it
// last existed; the Warden gone by then, it's the power — the rulings). No
// creature's power changes.
const DAMAGE_TEXT =
  "Each creature you control with toughness greater than its power assigns combat damage equal to its toughness rather than its power.";
const STATION_TEXT =
  "Each creature you control with toughness greater than its power stations permanents using its toughness rather than its power.";

export default defineCard({
  name: "Tapestry Warden",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${DAMAGE_TEXT}\n${STATION_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      combatDamageByToughness: "if-toughness-greater",
      text: DAMAGE_TEXT,
    },
    {
      affects: { scope: "creatures-you-control" },
      stationsByToughness: "if-toughness-greater",
      text: STATION_TEXT,
    },
  ],
});
