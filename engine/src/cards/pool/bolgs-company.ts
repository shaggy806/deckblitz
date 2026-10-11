import { defineCard } from "../define.js";

// EDHREC rank 13786.
//
// "Another Goblin": a static's condition already leaves its own permanent out
// of the count (Dáin's Company's shape); the sacrifice cost's `otherOnly`
// keeps this creature out of its own cost.
const HASTE_TEXT = "This creature has haste as long as you control another Goblin.";
const MANA_TEXT = "{T}, Sacrifice another Goblin: Add {B}{R}.";

export default defineCard({
  name: "Bolg's Company",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${HASTE_TEXT}\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Goblin" }, atLeast: 1 },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Goblin" } } },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["B", "R"] }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
      otherOnly: true,
    },
  ],
});
