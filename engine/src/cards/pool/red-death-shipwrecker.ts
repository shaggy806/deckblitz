import { defineCard } from "../define.js";

// EDHREC rank 6349. It targets, so it isn't a mana ability (rule 605.1a) and
// uses the stack, and an illegal target stops all three clauses (the rulings).
const ABILITY = "Alluring Eyes — {T}: Goad target creature an opponent controls. That player draws a card. You add {R}.";

export default defineCard({
  name: "Red Death, Shipwrecker",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Crab", "Mutant"],
  power: 1,
  toughness: 3,
  text: `${ABILITY} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: 0 },
          { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
          { kind: "add-mana", mana: "R", amount: 1 },
        ],
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
