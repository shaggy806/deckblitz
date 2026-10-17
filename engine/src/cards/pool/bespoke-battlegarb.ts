import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION, equip } from "../helpers.js";

// EDHREC rank 20946.
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not
// the board: nonland permanents that entered under your control this turn
// count though they've left or changed control since (the rulings).
//
// "Attach this Equipment to up to one target creature you control" is one
// optional target slot (Blacksmith's Talent's shape): with none chosen the
// Equipment stays where it is.

const EQUIPPED_TEXT = "Equipped creature gets +2/+0.";
const CELEBRATION_TEXT =
  "Celebration — At the beginning of combat on your turn, if two or more nonland permanents entered the battlefield under your control this turn, attach this Equipment to up to one target creature you control.";

export default defineCard({
  name: "Bespoke Battlegarb",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${EQUIPPED_TEXT}\n${CELEBRATION_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: EQUIPPED_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: CELEBRATION_TEXT,
      condition: CELEBRATION_CONDITION,
    },
  ],
  activated: [equip("{2}")],
});
