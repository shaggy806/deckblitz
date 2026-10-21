import { defineCard } from "../define.js";

// EDHREC rank 20578.
//
// Rulings:
//   If some of the targets become illegal for Ral's second ability, the
//   original division of damage still applies, and the damage that would have
//   been dealt to illegal targets isn't dealt at all.
//
// The −2 is Mogg Mob's division, made as the ability goes on the stack.

export default defineCard({
  name: "Ral, Caller of Storms",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ral"],
  loyalty: 4,
  text: "+1: Draw a card.\n−2: Ral deals 3 damage divided as you choose among one, two, or three targets.\n−7: Draw seven cards. Ral deals 7 damage to each creature your opponents control.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "+1: Draw a card.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
      divided: { total: 3, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: "−2: Ral deals 3 damage divided as you choose among one, two, or three targets.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 7 },
          { kind: "damage-all", amount: 7, filter: { type: "creature", controlledBy: "opponent" } },
        ],
      },
      resolve: null,
      text: "−7: Draw seven cards. Ral deals 7 damage to each creature your opponents control.",
    },
  ],
});
