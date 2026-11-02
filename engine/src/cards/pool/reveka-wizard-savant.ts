import { defineCard } from "../define.js";

// Homelands. "Your next untap step" is the activator's (`untapStepOf`), so
// Reveka comes back under someone else without a pause.

const TEXT = "{T}: Reveka deals 2 damage to any target and doesn't untap during your next untap step.";

export default defineCard({
  name: "Reveka, Wizard Savant",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Dwarf", "Wizard"],
  power: 0,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true, untapStepOf: "you" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
