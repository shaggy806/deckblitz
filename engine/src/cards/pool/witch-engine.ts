import { defineCard } from "../define.js";

// EDHREC rank 23364.
//
// Rulings:
//   [2008-04-01] Because the ability is targeted, it is not a mana ability. It can only be
//     activated when you have priority, and goes on the stack like other non-mana abilities.
//
// Its target makes it a stack ability (`isManaAbility` wants no targets).

export default defineCard({
  name: "Witch Engine",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  keywords: ["swampwalk"],
  text: "Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n{T}: Add {B}{B}{B}{B}. Target opponent gains control of this creature. (Activate only as an instant.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "B", amount: 4 },
          { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
        ],
      },
      resolve: null,
      text: "{T}: Add {B}{B}{B}{B}. Target opponent gains control of this creature.",
    },
  ],
});
