import { defineCard } from "../define.js";

// EDHREC rank 8131.
// An adventurer card: Easy Pickings is its Adventure, in `easy-pickings.ts`.
// "Your first main phase" is the precombat main phase (Hulking Raptor's
// trigger).

const MANA_TEXT = "At the beginning of your first main phase, add {R}{R}.";

export default defineCard({
  name: "Glóin the Mighty",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 4,
  toughness: 3,
  text: MANA_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 2 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  faces: ["Glóin the Mighty", "Easy Pickings"],
  adventure: true,
});
