import { defineCard } from "../define.js";

// EDHREC rank 13110. Ferocious is checked as the spell resolves; "creatures
// can't block this turn" is a `restrict` over a filter — a rule for the rest
// of the turn binding every creature, yours and ones that enter later
// included (the ruling; rule 611.2c).

const DAMAGE_TEXT = "Barrage of Boulders deals 1 damage to each creature you don't control.";
const FEROCIOUS_TEXT = "Ferocious — If you control a creature with power 4 or greater, creatures can't block this turn.";

export default defineCard({
  name: "Barrage of Boulders",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${DAMAGE_TEXT}\n${FEROCIOUS_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
      {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } },
          atLeast: 1,
        },
        then: { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-block"] },
      },
    ],
  },
});
