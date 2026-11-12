import { defineCard } from "../define.js";

// EDHREC rank 15107.

export default defineCard({
  name: "Loyal Fire Sage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Ally"],
  power: 3,
  toughness: 3,
  text: "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)\n{5}: Create a 1/1 white Ally creature token.",
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 1 },
      resolve: null,
      text: "{5}: Create a 1/1 white Ally creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1, untilEndOfCombat: true },
      resolve: null,
      firebending: true,
      text: "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)",
    },
  ],
});
