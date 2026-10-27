import { defineCard } from "../define.js";

// EDHREC rank 16898.
//
// One target; the creatures sharing its name (rule 201.2a) are dealt the
// damage too, targeted or not (`CardFilter.sameNameAsTarget`).

const PING_TEXT =
  "{T}: This creature deals 1 damage to target creature and each other creature with the same name as that creature.";

export default defineCard({
  name: "Izzet Staticaster",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 3,
  keywords: ["flash", "haste"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nHaste\n${PING_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "damage-all", filter: { type: "creature", sameNameAsTarget: 0 }, amount: 1 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
