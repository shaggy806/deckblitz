import { defineCard } from "../define.js";

// Rulings:
//   If the targeted creature survives the damage, it can attack this turn, but no other creatures
//     can. If the targeted creature is destroyed, no creatures can attack this turn, including
//     creatures that enter later on.
//   For the second part of Intimidation Bolt's effect to do anything, it must be cast before
//     attackers are declared.
//   If the targeted creature has become an illegal target by the time Intimidation Bolt resolves,
//     Intimidation Bolt doesn't resolve. Creatures will still be able to attack that turn.
//
// "Other creatures can't attack this turn" is a turn-wide rule over every creature (rule 611.2c:
// one that enters later is bound too), leaving the target out as the object it is now
// (`exceptTarget`, rule 400.7) — so a target that dies and returns is a new object, bound too.

export default defineCard({
  name: "Intimidation Bolt",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Intimidation Bolt deals 3 damage to target creature. Other creatures can't attack this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "restrict", filter: { type: "creature" }, exceptTarget: 0, restrictions: ["cant-attack"] },
    ],
  },
});
