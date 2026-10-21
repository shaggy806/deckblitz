import { defineCard } from "../define.js";

// EDHREC rank 24310.
//
// A rule for the rest of the turn over every creature with defender, a
// creature that gains defender or enters later included (rule 611.2c — the
// `restrict` effect's `filter` form, Fire of Orthanc's).
const TEXT = "Whenever this creature attacks, creatures with defender can't block this turn.";

export default defineCard({
  name: "Goblin Locksmith",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "restrict", filter: { type: "creature", keyword: "defender" }, restrictions: ["cant-block"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
